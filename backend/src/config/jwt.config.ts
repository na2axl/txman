import { registerAs } from '@nestjs/config';

/**
 * Recognized configuration values for the JWT namespace.
 */
export const config = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET as string,
  expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? '', 10) || 3600,
}));
