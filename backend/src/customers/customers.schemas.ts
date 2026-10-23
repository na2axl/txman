import { z } from 'zod';

/**
 * Schema for validating the query parameters for listing customers.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const ListCustomersQuery = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Type for the query parameters for listing customers.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export type ListCustomersQuery = z.infer<typeof ListCustomersQuery>;
