import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { Public } from '../decorators/public.decorator.js';
import { UsersService } from '../users/users.service.js';
import { LoginInput } from './auth.schemas.js';
import { AuthService, type LoginResult } from './auth.service.js';
import type { AuthUser } from './auth.types.js';

/**
 * Authentication controller.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body({ schema: LoginInput }) body: LoginInput): Promise<LoginResult> {
    return this.authService.login(body.username, body.password);
  }

  @Get('me')
  async me(@CurrentUser() current: AuthUser) {
    const user = await this.usersService.findById(current.id);
    if (!user) throw new UnauthorizedException('User no longer exists');
    return { id: user.id, username: user.username };
  }
}
