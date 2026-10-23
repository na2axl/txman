import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { relations } from './index.js';

export type Database = NodePgDatabase<typeof relations>;
