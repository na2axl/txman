import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '@nestjs/drizzle';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import {
  appConfig,
  dbConfig,
  EnvironmentSchema,
  jwtConfig,
} from './config/index.js';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
