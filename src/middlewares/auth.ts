import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { Webhook } from 'svix'; // Using svix for Clerk Webhook verification

import { jwtSecret, clerkWebhookSecret } from '../config/config';
import { db } from '../db/dbconfig';
import { users } from '../db/schema';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

export interface AuthContext {
  userId: string;
  role?: string;
  email?: string;
  clerk_user_id?: string | null;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createHttpError(401, 'Missing or invalid Authorization header'));
    }

    const token = authHeader.slice(7).trim();

    let payload: (JwtPayload & { sub?: string; role?: string; email?: string; clerk_user_id?: string }) | null = null;

    try {
      payload = jwt.verify(token, jwtSecret) as JwtPayload & {
        sub?: string;
        role?: string;
        email?: string;
        clerk_user_id?: string;
      };
    } catch (err) {
      return next(createHttpError(401, 'Invalid or expired token'));
    }

    if (!payload?.sub) {
      return next(createHttpError(401, 'Invalid token payload'));
    }

    const userId = payload.sub as string;

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.user_id, userId))
      .limit(1);

    const user = rows[0];

    if (!user) {
      return next(createHttpError(401, 'User not found for token'));
    }

    if (!user.is_active) {
      return next(createHttpError(403, 'User account is inactive'));
    }

    req.auth = {
      userId,
      role: payload.role,
      email: payload.email ?? user.email,
      clerk_user_id: payload.clerk_user_id ?? user.clerk_user_id ?? null
    };

    return next();
  } catch (err) {
    return next(err as Error);
  }
}

// Extend Request type to include rawBody
declare module 'express-serve-static-core' {
  interface Request {
    rawBody?: Buffer;
    auth?: AuthContext;
  }
}

export const webhookVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (clerkWebhookSecret === 'no-secret-configured') {
    console.error('CLERK_WEBHOOK_SECRET is not configured. Webhook verification skipped (DANGEROUS).');
    // For development, allow unverified webhooks if secret is missing.
    // In production, this should immediately fail (return next(createHttpError(500, 'Webhook secret missing')));
    return next();
  }

  const svixId = req.headers['svix-id'] as string | undefined;
  const svixTimestamp = req.headers['svix-timestamp'] as string | undefined;
  const svixSignature = req.headers['svix-signature'] as string | undefined;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return next(createHttpError(400, 'Missing svix headers'));
  }

  // Check if rawBody is present (configured in src/app.ts)
  // This requires the global express.json to be configured with a verify function to populate req.rawBody
  if (!req.rawBody) {
    return next(createHttpError(500, 'Raw body is missing for verification'));
  }

  const payload = req.rawBody.toString();

  try {
    const wh = new Webhook(clerkWebhookSecret);
    wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
    
    // Webhook verified successfully, proceed to controller
    next();
  } catch (err) {
    console.error('Clerk Webhook verification failed:', err);
    return next(createHttpError(401, 'Webhook verification failed'));
  }
};
