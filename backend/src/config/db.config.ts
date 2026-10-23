import { registerAs } from '@nestjs/config';

/**
 * Recognized configuration values for the database namespace.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const config = registerAs('db', () => ({
  host: process.env.DATABASE_HOST as string,
  port: parseInt(process.env.DATABASE_PORT ?? '', 10) || 5432,
  name: process.env.DATABASE_NAME as string,
  user: process.env.DATABASE_USER as string,
  pass: process.env.DATABASE_PASSWORD as string,
}));
