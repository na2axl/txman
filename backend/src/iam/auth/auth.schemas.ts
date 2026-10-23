import { z } from 'zod';

/**
 * The schema for validating login input.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(64),
  password: z.string().min(1, 'Password is required').max(128),
});

/**
 * Login input type. Used for type safety.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export type LoginInput = z.infer<typeof loginSchema>;
