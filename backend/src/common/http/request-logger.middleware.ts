import { randomUUIDv7 } from 'node:crypto';
import { Logger } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../../iam/auth/auth.types.js';

const logger = new Logger('HTTP');

/**
 * Assigns a request id and logs method, path, status, duration, and authenticated user id.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export function requestLogger(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
): void {
  const requestId = request.header('x-request-id') ?? randomUUIDv7();
  response.setHeader('x-request-id', requestId);
  const startedAt = performance.now();

  response.on('finish', () => {
    const ms = Math.round(performance.now() - startedAt);
    logger.log(
      `${request.method} ${request.originalUrl} ${response.statusCode} ${ms}ms requestId=${requestId} userId=${request.user?.id ?? '-'}`,
    );
  });

  next();
}
