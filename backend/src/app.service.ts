import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DrizzleModuleFactoryOptions,
  DrizzleOptionsFactory,
} from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Config } from './config/index.js';
import { relations } from './db/index.js';

@Injectable()
export class AppService implements DrizzleOptionsFactory {
  constructor(private readonly configService: ConfigService<Config>) {}

  createDrizzleOptions(): DrizzleModuleFactoryOptions {
    const db = this.configService.get('db');
    return {
      drizzle,
      connection: `postgresql://${db.user}:${db.pass}@${db.host}:${db.port}/${db.name}`,
      relations,
    };
  }
}
