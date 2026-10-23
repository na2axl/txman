import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type {
  AccessTokenPayload,
  AuthenticatedRequest,
} from '../auth/auth.types.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

const BEARER_PREFIX = 'Bearer ';

/**
 * Guard that enforces authentication with a valid bearer token on every route unless `@Public()` is set.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    if (!header?.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        header.slice(BEARER_PREFIX.length),
      );
      request.user = { id: payload.sub };
    } catch {
      // Expired, malformed or badly signed: the caller only needs to know it is invalid.
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }
}
