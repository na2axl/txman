import { count, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { seed } from 'drizzle-seed';
import { hashPassword } from '../../iam/password/password.js';
import { customers, TransactionStatus, transactions, users } from '../index.js';
import { generateReference } from './reference.js';

const ADMIN_USER_ID = '511D82BD-ED33-75C8-B9A4-CB6086E938ED';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin1234';

const BULK_TRANSACTIONS = 200;
const HISTORY_DAYS = 90;
const CURRENCIES = ['XAF', 'USD', 'EUR', 'NGN', 'GHS'];

function randomReferences(total: number): string[] {
  const references = new Set<string>();
  while (references.size < total) {
    const date = new Date(
      Date.now() - Math.random() * HISTORY_DAYS * 86_400_000,
    );
    references.add(generateReference(date));
  }
  return [...references];
}

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required to run the seed.');

const db = drizzle(url);

const [{ total }] = await db.select({ total: count() }).from(transactions);
if (total > 0) {
  console.info(`Seed skipped: ${total} transactions already exist.`);
  process.exit(0);
}

await db
  .insert(users)
  .values({
    id: ADMIN_USER_ID,
    username: ADMIN_USERNAME,
    password_hash: await hashPassword(ADMIN_PASSWORD),
  })
  .onConflictDoNothing();

await seed(db, { customers, transactions }).refine((f) => ({
  customers: { count: 25, columns: { name: f.fullName() } },
  transactions: {
    count: BULK_TRANSACTIONS,
    columns: {
      creator_id: f.valuesFromArray({ values: [ADMIN_USER_ID] }),
      reference: f.valuesFromArray({
        values: randomReferences(BULK_TRANSACTIONS),
        isUnique: true,
      }),
      amount: f.int({ minValue: 1_000, maxValue: 5_000_000 }),
      currency: f.valuesFromArray({ values: CURRENCIES }),
      status: f.valuesFromArray({
        values: [
          { weight: 0.5, values: [TransactionStatus.PENDING] },
          { weight: 0.35, values: [TransactionStatus.APPROVED] },
          { weight: 0.15, values: [TransactionStatus.REJECTED] },
        ],
      }),
    },
  },
}));

// Spread the rows over time: the reference embeds its creation timestamp.
await db.execute(sql`
    UPDATE finances.transactions
    SET created_at = to_timestamp(substr(reference, 3, 14), 'YYYYMMDDHH24MISS'),
        updated_at = to_timestamp(substr(reference, 3, 14), 'YYYYMMDDHH24MISS')
`);

console.info('Seed complete.');
process.exit(0);
