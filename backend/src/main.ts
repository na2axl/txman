import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { setupOpenApi } from './common/openapi/openapi.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  setupOpenApi(app);
  await app.listen(process.env.APP_PORT ?? 3000);
}
await bootstrap();
