import { randomUUIDv7 } from 'node:crypto';
import { pgSchema, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

const iam = pgSchema('iam');

export const users = iam.table('users', {
  id: uuid('id').primaryKey().$default(randomUUIDv7),
  username: varchar('username', { length: 64 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),

  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
