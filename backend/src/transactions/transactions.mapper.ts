import type { TransactionStatus } from '../db/index.js';
import { allowedTransitions } from './transaction-status.js';

/**
 * Shape of a transaction as queried from the database.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export interface TransactionRow {
  id: string;
  reference: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  created_at: Date;
  updated_at: Date;
}

/**
 * Public representation of a transaction.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export interface TransactionResponse {
  id: string;
  reference: string;
  customer: { id: string; name: string };
  amount: number;
  currency: string;
  status: TransactionStatus;
  allowed_transitions: readonly TransactionStatus[];
  created_at: string;
  updated_at: string;
}

/**
 * Converts a transaction DB results to its public response schema.
 * @author Axel Nana <ax.lnana@outlook.com>
 * @param row The raw DB row.
 */
export function toTransactionResponse(
  row: TransactionRow,
): TransactionResponse {
  return {
    id: row.id,
    reference: row.reference,
    customer: { id: row.customer_id, name: row.customer_name },
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    allowed_transitions: allowedTransitions(row.status),
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
