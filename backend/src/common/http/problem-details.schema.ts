import { z } from 'zod';

/**
 * One field-level validation error.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const FieldError = z.object({
  field: z.string().describe('The errored field, i.e. `amount`'),
  message: z.string(),
});
export type FieldError = z.infer<typeof FieldError>;

/**
 * RFC 9457 problem details body returned for every error.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export const ProblemDetails = z.object({
  type: z.string().describe('Always `about:blank`'),
  title: z.string(),
  status: z.number().int(),
  detail: z.string(),
  instance: z.string().describe('Request path that caused the error'),
  request_id: z.string().optional(),
  errors: z
    .array(FieldError)
    .optional()
    .describe(
      'The list of errored fields with their messages. Present on 422 only',
    ),
});
export type ProblemDetails = z.infer<typeof ProblemDetails>;
