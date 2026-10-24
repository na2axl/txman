import { z } from 'zod';
import { validateMoney } from '../../common/money/money.js';
import { UUID } from '../../common/schemas.js';

export const CreateTransactionInput = z
  .object({
    reference: z
      .string()
      .regex(/^TX[0-9]{14}[A-Z0-9]{6}$/, 'Invalid reference format'),
    customer_id: UUID.optional(),
    customer_name: z.string().trim().min(1).max(255).optional(),
    amount: z.uint32(),
    currency: z.string().length(3),
  })
  .refine((v) => Boolean(v.customer_id) !== Boolean(v.customer_name), {
    message: 'Provide either customer_id or customer_name',
    path: ['customer_id'],
  })
  .transform((value, context) => {
    const parsed = validateMoney(value.amount, value.currency);
    if (!parsed.ok) {
      context.addIssue({
        code: 'custom',
        message: parsed.error,
        path: ['amount'],
      });
      return z.NEVER;
    }
    return { ...value, money: parsed.money };
  });

export type CreateTransactionInput = z.output<typeof CreateTransactionInput>;
