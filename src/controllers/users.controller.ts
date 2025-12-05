import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';


import { db } from '../db/dbconfig';
import { users, NewUser, User } from '../db/schema';
import { jwtSecret, jwtExpiresIn } from '../config/config';
import { AuthContext } from '../middlewares/auth';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

const allowedRoles: User['role'][] = ['student', 'farmer', 'admin', 'super_admin'];

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      clerk_user_id,
      email,
      first_name,
      last_name,
      role,
      location_id,
      preferences
    } = req.body as Partial<NewUser>;

    let parsedPreferences: unknown | undefined = undefined;
    if (typeof preferences === 'string') {
      try {
        parsedPreferences = preferences ? JSON.parse(preferences) : undefined;
      } catch {
        return next(createHttpError(400, 'Invalid preferences JSON'));
      }
    } else {
      parsedPreferences = preferences;
    }

    if (!email) {
      return next(createHttpError(400, 'Email is required'));
    }

    if (role && !allowedRoles.includes(role as User['role'])) {
      return next(createHttpError(400, 'Invalid role'));
    }

    const existingByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email!))
      .limit(1);

    if (existingByEmail.length > 0) {
      return next(createHttpError(409, 'Email is already registered'));
    }

    if (clerk_user_id) {
      const existingByClerk = await db
        .select()
        .from(users)
        .where(eq(users.clerk_user_id, clerk_user_id))
        .limit(1);

      if (existingByClerk.length > 0) {
        return next(createHttpError(409, 'clerk_user_id is already registered'));
      }
    }

    const [created] = await db
      .insert(users)
      .values({
        clerk_user_id,
        email,
        first_name,
        last_name,
        role: role as User['role'] | undefined,
        location_id,
        preferences: parsedPreferences as NewUser['preferences']
      } as NewUser)
      .returning();

    const { password_hash, ...safeUser } = created as any;
    res.status(201).json(safeUser);
  } catch (err) {
    next(err as Error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { clerk_user_id, email } = req.body as {
      clerk_user_id?: string;
      email?: string;
    };

    if (!clerk_user_id && !email) {
      return next(
        createHttpError(400, 'Either clerk_user_id or email must be provided')
      );
    }

    let query;

    if (clerk_user_id) {
      query = db
        .select()
        .from(users)
        .where(eq(users.clerk_user_id, clerk_user_id))
        .limit(1);
    } else {
      query = db
        .select()
        .from(users)
        .where(eq(users.email, email!))
        .limit(1);
    }

    const result = await query;
    const user = result[0];

    if (!user) {
      return next(createHttpError(401, 'Invalid credentials'));
    }

    if (!user.is_active) {
      return next(createHttpError(403, 'User account is inactive'));
    }

    // Password verification removed; relies on external identity provider or other checks

    const payload = {
      sub: user.user_id,
      role: user.role,
      email: user.email,
      clerk_user_id: user.clerk_user_id
    };

    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiresIn
    });

    const { password_hash, ...safeUser } = user as any;
    res.status(200).json({
      access_token: token,
      token_type: 'Bearer',
      user: safeUser
    });
  } catch (err) {
    next(err as Error);
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return next(createHttpError(400, 'user_id is required'));
    }

    const auth = (req as any).auth as AuthContext | undefined;

    if (!auth) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (auth.userId !== userId && auth.role !== 'admin' && auth.role !== 'super_admin') {
      return next(createHttpError(403, 'Forbidden'));
    }

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.user_id, userId))
      .limit(1);

    const user = rows[0];

    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    const { password_hash, ...safeUser } = user as any;
    res.status(200).json(safeUser);
  } catch (err) {
    next(err as Error);
  }
};

export const getUserDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return next(createHttpError(400, 'user_id is required'));
    }

    const auth = (req as any).auth as AuthContext | undefined;

    if (!auth) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (auth.userId !== userId && auth.role !== 'admin' && auth.role !== 'super_admin') {
      return next(createHttpError(403, 'Forbidden'));
    }

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.user_id, userId))
      .limit(1);

    const user = rows[0];

    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    const { password_hash, ...safeUser } = user as any;
    res.status(200).json({
      user: safeUser,
      dashboard: {
        message: 'User dashboard data not yet implemented'
      }
    });
  } catch (err) {
    next(err as Error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth = (req as any).auth as AuthContext | undefined;

    if (!auth) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (auth.role !== 'admin' && auth.role !== 'super_admin') {
      return next(createHttpError(403, 'Forbidden'));
    }

    const allUsers = await db.select().from(users).limit(100);
    const safeUsers = allUsers.map((u: any) => {
      const { password_hash, ...rest } = u;
      return rest;
    });
    res.status(200).json({ users: safeUsers });
  } catch (err) {
    next(err as Error);
  }
};


export const syncUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // TODO: Implement Clerk webhook handler logic for user synchronization (create/update/delete).
    // The request body contains the Clerk event payload.
    // The webhookVerification middleware should handle authentication.

    // Acknowledge receipt immediately, processing can happen asynchronously if complex.
    // For now, simple logging and 200 response.
    console.log('Clerk Webhook Received:', req.body.type, 'for user:', req.body.data.id);

    res.status(200).json({ received: true });
  } catch (err) {
    // Webhook failures should not typically rely on standard error handling as Clerk might retry.
    // For now, logging error but still returning 200 to Clerk to prevent retries on application error.
    console.error('Error processing Clerk Webhook:', err);
    res.status(200).json({ received: true, error: true });
  }
};

export const getProfileByToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth = (req as any).auth as AuthContext | undefined;

    if (!auth || !auth.clerk_user_id) {
      // Should be caught by the authenticate middleware, but good defense in depth.
      return next(createHttpError(401, 'Unauthorized'));
    }

    // Find user by clerk_user_id from the authenticated token payload
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.clerk_user_id, auth.clerk_user_id))
      .limit(1);

    const user = rows[0];

    if (!user) {
      // This means the user is authenticated via Clerk but no local record exists (e.g., sync failed or hasn't run yet)
      return next(createHttpError(403, 'Local user profile not found. Synchronization may be pending.'));
    }

    const { password_hash, ...safeUser } = user as any;
    res.status(200).json(safeUser);
  } catch (err) {
    next(err as Error);
  }
};
