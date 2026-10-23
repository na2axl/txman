import { Simplify } from 'type-fest';
import { z } from 'zod';
import { AppEnv, config as appConfig } from './app.config.js';
import { config as dbConfig } from './db.config.js';
import { config as jwtConfig } from './jwt.config.js';

/**
 * Flattens a type by prefixing each key with a string template.
 * @template T The type to flatten.
 * @template P The string template to use for prefixing.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
type FlattenConfigType<T, P extends string> = {
  [root in P]: T;
} & {
  [K in keyof T as `${P}.${string & K}`]: T[K];
};

/**
 * Application configuration.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export type Config = Simplify<
  FlattenConfigType<ReturnType<typeof appConfig>, 'app'> &
    FlattenConfigType<ReturnType<typeof dbConfig>, 'db'> &
    FlattenConfigType<ReturnType<typeof jwtConfig>, 'jwt'>
>;

/**
 * Environment variables schema.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const EnvironmentSchema = z.object({
  //#region Application configuration
  APP_ENV: z.string().optional().default(AppEnv.DEVELOPMENT),
  APP_PORT: z.coerce.number().optional().default(3000),
  APP_NAME: z.string().optional().default('Transaction Manager'),
  //#endregion

  //#region Database configuration
  DATABASE_HOST: z.string().optional().default('localhost'),
  DATABASE_PORT: z.coerce.number().optional().default(5432),
  DATABASE_NAME: z.string().optional().default('ejara_txman'),
  DATABASE_USER: z.string().optional().default('postgres'),
  DATABASE_PASSWORD: z.string().optional().default('postgres'),
  //#endregion

  //#region Authentication configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  /** Access token lifetime, in seconds. */
  JWT_EXPIRES_IN: z.coerce.number().int().positive().optional().default(3600),
  //#endregion
});

export { appConfig, dbConfig, jwtConfig };
