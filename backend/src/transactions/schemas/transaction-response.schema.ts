import { z } from 'zod';
import { UUID } from '../../common/schemas.js';
import { TransactionStatus } from '../../db/index.js';

/**
 * Public representation of a transaction. Source of both the response type and
 * the OpenAPI documentation.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const TransactionResponse = z.object({
  id: UUID,
  reference: z
    .string()
    .describe('TX{YYYYMMDDHHmmSS}{6 uppercase alphanumerics}'),
  customer: z.object({ id: UUID, name: z.string() }),
  amount: z
    .number()
    .int()
    .describe('Integer in minor units, i.e. 12550 for USD 125.50'),
  currency: z.string().describe('ISO 4217 code, i.e. XAF'),
  status: z.enum(TransactionStatus),
  allowed_transitions: z
    .array(z.enum(TransactionStatus))
    .readonly()
    .describe('Statuses this transaction may move to; empty once it is final'),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export type TransactionResponse = z.infer<typeof TransactionResponse>;

/**
 * A page of transactions with the pagination metadata.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const TransactionPage = z.object({
  data: z.array(TransactionResponse),
  meta: z.object({
    total: z.number().int().describe('Number of rows matching the filters'),
    page: z.number().int(),
    page_size: z.number().int(),
  }),
});

export type TransactionPage = z.infer<typeof TransactionPage>;
