import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '@nestjs/drizzle';
import { AppService } from './app.service.js';
import { HealthController } from './common/health/health.controller.js';
import {
  appConfig,
  dbConfig,
  EnvironmentSchema,
  jwtConfig,
} from './config/index.js';
import { CustomersModule } from './customers/customers.module.js';
import { IamModule } from './iam/iam.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [appConfig, dbConfig, jwtConfig],
      validationSchema: EnvironmentSchema,
    }),
    DrizzleModule.forRootAsync({
      imports: [ConfigModule],
      useClass: AppService,
    }),
    IamModule,
    CustomersModule,
  ],
  controllers: [HealthController],
  providers: [AppService],
})
export class AppModule {}
