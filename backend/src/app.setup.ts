import {
  type INestApplication,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { ProblemDetailsFilter } from './common/http/problem-details.filter.js';
import { requestLogger } from './common/http/request-logger.middleware.js';
import { validationException } from './common/http/validation.js';

/**
 * Sets up the application, adding a request logger, global prefix, and
 * schema-based validation pipes. This is shared beween HTTP server and e2e tests.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1');
  app.use(requestLogger);
  app.useGlobalPipes(
    new StandardSchemaValidationPipe({ exceptionFactory: validationException }),
  );
  app.useGlobalFilters(new ProblemDetailsFilter());
}
