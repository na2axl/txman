import { z } from 'zod';

const PAGE_SIZES = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = PAGE_SIZES;

export const transactionsSearchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  page_size: z
    .number()
    .int()
    .refine((v) => (PAGE_SIZES as readonly number[]).includes(v))
    .optional()
    .catch(undefined),
  search: z.coerce.string().trim().min(1).max(100).optional().catch(undefined),
  status: z
    .enum(['PENDING', 'APPROVED', 'REJECTED'])
    .optional()
    .catch(undefined),
  customer_id: z.uuid().optional().catch(undefined),
  sort_by: z
    .enum(['created_at', 'updated_at', 'amount', 'reference', 'status'])
    .optional()
    .catch(undefined),
  order: z.enum(['asc', 'desc']).optional().catch(undefined),
});

export type TransactionsSearch = z.infer<typeof transactionsSearchSchema>;

export function hasActiveFilters(search: TransactionsSearch): boolean {
  return Boolean(search.search || search.status || search.customer_id);
}
