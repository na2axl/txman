import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ProblemDetails } from '../http/problem-details.schema.js';

const DESCRIPTIONS: Partial<Record<HttpStatus, string>> = {
  [HttpStatus.UNAUTHORIZED]: 'Missing, invalid or expired bearer token',
  [HttpStatus.NOT_FOUND]: 'Resource not found',
  [HttpStatus.CONFLICT]: 'Conflict with the current state of the resource',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Request validation failed',
};

/**
 * Documents error responses as `application/problem+json`.
 * @author Axel Nana <ax.lnana@outlook.com>
 * @param statuses The error statuses the operation can return.
 */
export function ApiProblem(...statuses: HttpStatus[]) {
  return applyDecorators(
    ...statuses.map((status) =>
      ApiResponse({
        status,
        description: DESCRIPTIONS[status] ?? 'Error',
        standardSchema: ProblemDetails,
      }),
    ),
  );
}
