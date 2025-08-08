// user-token.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserTokenService } from './user-token.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

describe('UserTokenService', () => {
  let service: UserTokenService;
  const jwtServiceMock = { /* no methods used in current implementation */ } as any;
  const userServiceMock = {
    updateUserRefreshToken: jest.fn().mockResolvedValue(undefined),
    // optional getToken method not defined
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTokenService,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compile();

    service = module.get<UserTokenService>(UserTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('generateTokens should return placeholder tokens', async () => {
    const result = await service.generateTokens({});
    expect(result).toEqual({ access_token: 'access', refresh_token: 'refresh' });
  });

  it('hashRefreshToken should hash using bcrypt with correct salt', async () => {
    const token = 'myRefreshToken';
    const hash = await service.hashRefreshToken(token);
    expect(hash).toBeDefined();
    const match = await bcrypt.compare(token, hash);
    expect(match).toBe(true);
  });

  it('persistRefreshToken should delegate to UserService', async () => {
    await service.persistRefreshToken(1, 'hashed');
    expect(userServiceMock.updateUserRefreshToken).toHaveBeenCalledWith(1, 'hashed');
  });

  it('setRefreshCookie should set cookie on response', () => {
    const res = { cookie: jest.fn() } as unknown as Response;
    service.setRefreshCookie(res, 'token');
    expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'token', expect.objectContaining({ httpOnly: true }));
  });

  it('clearRefreshCookie should clear cookie on response', () => {
    const res = { clearCookie: jest.fn() } as unknown as Response;
    service.clearRefreshCookie(res);
    expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
  });
});
