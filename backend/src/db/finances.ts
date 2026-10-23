import { randomUUIDv7 } from 'node:crypto';
import { defineRelations, sql } from 'drizzle-orm';
import {
  bigint,
  check,
  index,
  pgSchema,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const finances = pgSchema('finances');

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export const transactionStatus = finances.enum(
  'transaction_status',
  Object.values(TransactionStatus) as [
    TransactionStatus,
    ...TransactionStatus[],
  ],
);

export const customers = finances.table(
  'customers',
  {
    id: uuid('id').primaryKey().$default(randomUUIDv7),
    name: varchar('name', { length: 255 }).notNull(),

    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    check('customers_name_not_blank', sql`length(btrim(${t.name})) > 0`),
    index('customers_name_trgm_idx').using('gin', sql`${t.name} gin_trgm_ops`),
  ],
);

export const transactions = finances.table(
  'transactions',
  {
    id: uuid('id').primaryKey().$default(randomUUIDv7),
    customer_id: uuid('customer_id')
      .notNull()
      .references(() => customers.id, {
        onDelete: 'restrict',
      }),
    creator_id: uuid('creator_id').notNull(),

    reference: varchar('reference', { length: 22 }).notNull().unique(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    status: transactionStatus('status')
      .notNull()
      .default(TransactionStatus.PENDING),

    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    check('transactions_amount_positive', sql`${t.amount} > 0`),
    check('transactions_currency_format', sql`${t.currency} ~ '^[A-Z]{3}$'`),
    check(
      'transactions_reference_format',
      sql`${t.reference} ~ '^TX[0-9]{14}[A-Z0-9]{6}$'`,
    ),
    index('transactions_customer_created_idx').on(t.customer_id, t.created_at),
    index('transactions_creator_created_idx').on(t.creator_id, t.created_at),
    index('transactions_status_created_idx').on(t.status, t.created_at),
    index('transactions_created_idx').on(t.created_at),
    index('transactions_reference_trgm_idx').using(
      'gin',
      sql`${t.reference} gin_trgm_ops`,
    ),
  ],
);

export const financesRelations = defineRelations(
  {
    customers,
    transactions,
  },
  (r) => ({
    transactions: {
      customer: r.one.customers({
        from: r.transactions.customer_id,
        to: r.customers.id,
      }),
    },
    customers: {
      transactions: r.many.transactions(),
    },
  }),
);
