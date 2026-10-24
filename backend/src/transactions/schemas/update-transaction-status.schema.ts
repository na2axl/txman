import { z } from 'zod';
import { TransactionStatus } from '../../db/index.js';

export const UpdateTransactionStatusInput = z.object({
  status: z.enum(TransactionStatus),
});

export type UpdateTransactionStatusInput = z.infer<
  typeof UpdateTransactionStatusInput
>;
