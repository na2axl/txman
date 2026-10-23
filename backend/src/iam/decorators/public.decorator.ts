import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'iam:decorator:isPublic';

/**
 * Opts a route (or controller) out of the global authentication guard.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
