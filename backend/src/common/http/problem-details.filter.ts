import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { status as HttpStatus } from 'http-status';
import { InvalidStatusTransitionError } from '../../transactions/errors/invalid-status-transition.error.js';

/**
 * Describes an error for a specific field in a 422 response.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * RFC 9457 compliant problem details body.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  request_id?: string;
  errors?: FieldError[];
}

/**
 * Turns every error into a single `application/problem+json` shape.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ProblemDetailsFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const { status, detail, errors } = this.describe(exception);
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ProblemDetails = {
      type: 'about:blank',
      title:
        (HttpStatus[status as keyof typeof HttpStatus] as string | undefined) ??
        'Error',
      status,
      detail,
      instance: request.originalUrl,
      request_id: response.getHeader('x-request-id')?.toString(),
      ...(errors && { errors }),
    };
    response.status(status).type('application/problem+json').json(body);
  }

  private describe(exception: unknown): {
    status: number;
    detail: string;
    errors?: FieldError[];
  } {
    if (exception instanceof InvalidStatusTransitionError) {
      return { status: HttpStatus.CONFLICT, detail: exception.message };
    }

    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      const message =
        typeof payload === 'string'
          ? payload
          : ((payload as { message?: string | string[] }).message ??
            exception.message);
      const errors =
        typeof payload === 'object'
          ? (payload as { errors?: FieldError[] }).errors
          : undefined;

      return {
        status: exception.getStatus(),
        detail: Array.isArray(message) ? message.join('; ') : message,
        errors,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: 'An unexpected error occurred',
    };
  }
}
