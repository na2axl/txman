import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Config } from '../../config/index.js';
import { hashPassword, verifyPassword } from '../password/password.js';
import { type User, UsersService } from '../users/users.service.js';
import type { AccessTokenPayload } from './auth.types.js';

/**
 * The result of a successful login.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export interface LoginResult {
  /** The access token used to authenticate requests. */
  access_token: string;
  /** The expected token type. */
  token_type: 'Bearer';
  /** Token lifetime in seconds. */
  expires_in: number;
}

/**
 * The service for managing authentication.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
@Injectable()
export class AuthService {
  /** Dummy hash verified against unknown users to avoid timing attacks. */
  private readonly dummyHash = hashPassword('invalid-password');

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Config>,
  ) {}

  /**
   * Logs in a user with the given username and password.
   * @param username The username of the user to log in.
   * @param password The password of the user to log in.
   * @returns The login result if the user is valid.
   * @throws UnauthorizedException if the username or password is invalid.
   */
  async login(username: string, password: string): Promise<LoginResult> {
    const user = await this.usersService.findByUsername(username);
    const valid = await verifyPassword(
      password,
      user?.password_hash ?? (await this.dummyHash),
    );
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return this.issueToken(user);
  }

  private async issueToken(user: User): Promise<LoginResult> {
    const payload: AccessTokenPayload = { sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
      token_type: 'Bearer',
      expires_in: this.configService.getOrThrow('jwt.expiresIn'),
    };
  }
}
