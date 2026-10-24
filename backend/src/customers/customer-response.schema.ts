import { z } from 'zod';
import { UUID } from '../common/schemas.js';

/**
 * Public representation of a customer.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const CustomerResponse = z.object({ id: UUID, name: z.string() });
export type CustomerResponse = z.infer<typeof CustomerResponse>;

/**
 * Collection of customers.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const CustomerCollection = z.object({ data: z.array(CustomerResponse) });
export type CustomerCollection = z.infer<typeof CustomerCollection>;
