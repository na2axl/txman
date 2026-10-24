import type { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';

const DOCS_PATH = 'api/docs';

/**
 * Builds the OpenAPI document from the routes and their zod schemas.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Transaction Manager API')
    .setDescription('REST API for transactions.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  return SwaggerModule.createDocument(app, config);
}

/**
 * Serves the interactive docs at `/api/docs` and the raw document at
 * `/api/docs.json`.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export function setupOpenApi(app: INestApplication): void {
  SwaggerModule.setup(DOCS_PATH, app, buildOpenApiDocument(app), {
    jsonDocumentUrl: `${DOCS_PATH}.json`,
  });
}
