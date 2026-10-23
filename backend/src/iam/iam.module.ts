import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import type { Config } from '../config/index.js';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { AuthGuard } from './guards/auth.guard.js';
import { UsersService } from './users/users.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Config>) => ({
        secret: config.get('jwt.secret'),
        signOptions: {
          algorithm: 'HS256',
          expiresIn: config.get('jwt.expiresIn'),
        },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class IamModule {}
