import { z } from 'zod';
import { UUID } from '../../common/schemas.js';

/**
 * The result of a successful login.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const LoginResult = z.object({
  access_token: z.string().describe('JWT to send as `Authorization: Bearer`'),
  token_type: z.literal('Bearer'),
  expires_in: z.number().int().describe('Token lifetime in seconds'),
});
export type LoginResult = z.infer<typeof LoginResult>;

/**
 * The authenticated user.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const CurrentUserResponse = z.object({ id: UUID, username: z.string() });
export type CurrentUserResponse = z.infer<typeof CurrentUserResponse>;
