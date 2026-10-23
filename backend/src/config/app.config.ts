import { registerAs } from '@nestjs/config';

/**
 * Accepted values for the application environment.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export enum AppEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TESTING = 'test',
}

/**
 * Recognized configuration values for the application namespace.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const config = registerAs('app', () => ({
  env: (process.env.APP_ENV ?? AppEnv.DEVELOPMENT) as AppEnv,
  port: parseInt(process.env.APP_PORT ?? '', 10) || 3000,
  name: process.env.APP_NAME ?? 'Transaction Manager',
}));
