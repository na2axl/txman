import { z } from 'zod';
import { UUID } from '../../common/schemas.js';
import { TransactionStatus } from '../../db/index.js';

export const SORT_FIELDS = [
  'created_at',
  'updated_at',
  'amount',
  'reference',
  'status',
] as const;

export const ListTransactionsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(100).optional(),
  status: z.enum(TransactionStatus).optional(),
  customer_id: UUID.optional(),
  sort_by: z.enum(SORT_FIELDS).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type ListTransactionsQuery = z.infer<typeof ListTransactionsQuery>;
