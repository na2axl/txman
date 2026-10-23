import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { hashPassword } from '../password/password.js';
import type { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const findByUsername = vi.fn();
  const signAsync = vi.fn().mockResolvedValue('signed.jwt.token');
  let service: AuthService;

  beforeEach(async () => {
    findByUsername.mockReset();
    findByUsername.mockResolvedValue({
      id: 'user-1',
      username: 'admin',
      password_hash: await hashPassword('admin1234'),
    });
    service = new AuthService(
      { findByUsername } as unknown as UsersService,
      { signAsync } as unknown as JwtService,
      { getOrThrow: () => 3600 } as unknown as ConfigService,
    );
  });

  it('returns a bearer token for valid credentials', async () => {
    await expect(service.login('admin', 'admin1234')).resolves.toEqual({
      access_token: 'signed.jwt.token',
      token_type: 'Bearer',
      expires_in: 3600,
    });
    expect(signAsync).toHaveBeenCalledWith({ sub: 'user-1' });
  });

  it('rejects a wrong password', async () => {
    await expect(service.login('admin', 'nope')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an unknown user with the same error', async () => {
    findByUsername.mockResolvedValue(undefined);
    await expect(service.login('ghost', 'admin1234')).rejects.toThrow(
      'Invalid username or password',
    );
  });
});
