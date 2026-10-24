import { z } from 'zod';

/**
 * Schema and type for UUID validation.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const UUID = z.uuid({ version: 'v7' });
export type UUID = z.infer<typeof UUID>;
