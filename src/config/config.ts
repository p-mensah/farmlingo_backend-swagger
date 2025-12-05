import dotenv from 'dotenv';
import type ms from 'ms';

dotenv.config();

export const port: number = process.env.PORT ? Number(process.env.PORT) : 4000;
export const nodeEnv: string = process.env.NODE_ENV || 'development';
export const appName: string = process.env.APP_NAME || 'farmlingo-backend';
export const healthMessage: string = process.env.HEALTH_OK_MESSAGE || 'ok';
export const jwtSecret: string = process.env.JWT_SECRET_KEY || 'change-me';
export const jwtExpiresIn: ms.StringValue | number =
  (process.env.JWT_EXPIRES_IN as ms.StringValue | undefined) || ('1h' as ms.StringValue);

export const clerkWebhookSecret: string = process.env.CLERK_WEBHOOK_SECRET || 'no-secret-configured';
