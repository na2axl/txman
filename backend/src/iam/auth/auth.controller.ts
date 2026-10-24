import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiProblem } from '../../common/openapi/api-problem.decorator.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { Public } from '../decorators/public.decorator.js';
import { UsersService } from '../users/users.service.js';
import { LoginInput } from './auth.schemas.js';
import { AuthService } from './auth.service.js';
import type { AuthUser } from './auth.types.js';
import { CurrentUserResponse, LoginResult } from './auth-response.schema.js';

/**
 * Authentication controller.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in',
    description: 'Exchanges a username and password for a JWT access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Access token',
    standardSchema: LoginResult,
  })
  @ApiProblem(HttpStatus.UNAUTHORIZED, HttpStatus.UNPROCESSABLE_ENTITY)
  login(@Body({ schema: LoginInput }) body: LoginInput): Promise<LoginResult> {
    return this.authService.login(body.username, body.password);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'The authenticated user',
    standardSchema: CurrentUserResponse,
  })
  @ApiProblem(HttpStatus.UNAUTHORIZED)
  async me(@CurrentUser() current: AuthUser): Promise<CurrentUserResponse> {
    const user = await this.usersService.findById(current.id);
    if (!user) throw new UnauthorizedException('User no longer exists');
    return { id: user.id, username: user.username };
  }
}
