import {
  type StandardSchemaValidationPipeOptions,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { FieldError } from './problem-details.filter.js';

type Issues = Parameters<
  NonNullable<StandardSchemaValidationPipeOptions['exceptionFactory']>
>[0];

function fieldOf(issue: Issues[number]): string {
  return (issue.path ?? [])
    .map((segment) =>
      typeof segment === 'object' ? String(segment.key) : String(segment),
    )
    .join('.');
}

/**
 * Adds per-field errors to the 422 response from the schema validation pipe.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export function validationException(
  issues: Issues,
): UnprocessableEntityException {
  const errors: FieldError[] = issues.map((issue) => ({
    field: fieldOf(issue),
    message: issue.message,
  }));

  return new UnprocessableEntityException({
    message: 'Request validation failed',
    errors,
  });
}
