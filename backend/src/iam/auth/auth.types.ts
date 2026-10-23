import type { Request } from 'express';

/**
 * The authenticated principal attached to a request by the auth guard.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export interface AuthUser {
  id: string;
}

/**
 * The payload of an access token.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export interface AccessTokenPayload {
  sub: string;
}

/**
 * The request type with the authenticated user attached.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export type AuthenticatedRequest = Request & { user?: AuthUser };
