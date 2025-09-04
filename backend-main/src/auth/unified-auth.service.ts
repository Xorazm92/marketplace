import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

export type AuthProvider = 'sms' | 'google' | 'telegram';

export interface AuthUserPayload {
  id: number;
  email?: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  authProvider: AuthProvider;
}

@Injectable()
export class UnifiedAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Generate JWT tokens
  async generateTokens(payload: AuthUserPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: payload.id,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          isVerified: payload.isVerified,
          provider: payload.authProvider,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET', 'your-access-secret'),
          expiresIn: '15m', // 15 minutes
        },
      ),
      this.jwtService.signAsync(
        {
          sub: payload.id,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          isVerified: payload.isVerified,
          provider: payload.authProvider,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'your-refresh-secret'),
          expiresIn: '7d', // 7 days
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  // Update or create refresh token in the database
  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    
    await this.prisma.$executeRaw`
      UPDATE "auth_method" 
      SET "refreshToken" = ${hashedRefreshToken}
      WHERE "userId" = ${userId} AND "isPrimary" = true;
    `;
  }

  // Find or create user based on provider
  async findOrCreateUser(provider: AuthProvider, providerData: {
    providerId?: string;
    email?: string;
    phoneNumber?: string;
    firstName: string;
    lastName: string;
    profileImg?: string;
  }) {
    const { providerId, email, phoneNumber, firstName, lastName, profileImg } = providerData;

    // Check if user exists with this auth method
    if (providerId) {
      const existingAuth = await this.prisma.$queryRaw`
        SELECT u.* 
        FROM "user" u
        JOIN "auth_method" am ON u.id = am."userId"
        WHERE am.provider = ${provider} AND am."providerId" = ${providerId}
        LIMIT 1;
      ` as any[];

      if (existingAuth && existingAuth.length > 0) {
        return existingAuth[0];
      }
    }

    // Check if user exists with the same email or phone
    const conditions = [];
    if (email) conditions.push(`email = '${email}'`);
    if (phoneNumber) conditions.push(`"phone_number" = '${phoneNumber}'`);
    
    let existingUser = null;
    if (conditions.length > 0) {
      const query = `SELECT * FROM "user" WHERE ${conditions.join(' OR ')} LIMIT 1;`;
      const result = await this.prisma.$queryRawUnsafe(query) as any[];
      existingUser = result.length > 0 ? result[0] : null;
    }

    if (existingUser) {
      // Link this auth method to existing user
      await this.prisma.$executeRaw`
        INSERT INTO "auth_method" 
        ("userId", provider, "providerId", "isPrimary", "createdAt", "updatedAt")
        VALUES (${existingUser.id}, ${provider}, ${providerId}, false, NOW(), NOW());
      `;
      return existingUser;
    }

    // Create new user and auth method in a transaction
    return await this.prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.$executeRaw`
        INSERT INTO "user" 
        (email, "phone_number", "first_name", "last_name", "profile_img", 
         "is_active", "is_verified", "createdAt", "updatedAt")
        VALUES (${email}, ${phoneNumber}, ${firstName}, ${lastName}, ${profileImg || null},
                true, false, NOW(), NOW())
        RETURNING *;
      ` as any;

      if (!newUser || !newUser[0]) {
        throw new Error('Failed to create user');
      }

      // Create auth method
      await tx.$executeRaw`
        INSERT INTO "auth_method" 
        ("userId", provider, "providerId", "isPrimary", "createdAt", "updatedAt")
        VALUES (${newUser[0].id}, ${provider}, ${providerId}, true, NOW(), NOW());
      `;

      return newUser[0];
    });
  }

  // SMS Authentication
  async smsLogin(phoneNumber: string, code: string) {
    // TODO: Implement SMS code verification with your SMS provider
    // This is a placeholder - replace with actual SMS verification
    const isValidCode = await this.verifySmsCode(phoneNumber, code);
    if (!isValidCode) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Find or create user
    const user = await this.findOrCreateUser('sms', {
      phoneNumber,
      firstName: 'User', // Default first name
      lastName: phoneNumber.slice(-4), // Last 4 digits as default last name
    });

    // Generate tokens
    const tokens = await this.generateTokens({
      id: user.id,
      phoneNumber: user.phone_number,
      firstName: user.first_name,
      lastName: user.last_name,
      isVerified: user.is_verified,
      authProvider: 'sms',
    });

    // Update refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // Google Authentication
  async googleLogin(googleUser: {
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImg?: string;
  }) {
    const { providerId, email, firstName, lastName, profileImg } = googleUser;

    // Find or create user
    const user = await this.findOrCreateUser('google', {
      providerId,
      email,
      firstName,
      lastName,
      profileImg,
    });

    // Generate tokens
    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      phoneNumber: user.phone_number,
      firstName: user.first_name,
      lastName: user.last_name,
      isVerified: user.is_verified,
      authProvider: 'google',
    });

    // Update refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // Telegram Authentication
  async telegramLogin(telegramUser: {
    id: string;
    username?: string;
    firstName: string;
    lastName?: string;
    photoUrl?: string;
  }) {
    const { id, username, firstName, lastName, photoUrl } = telegramUser;

    // Find or create user
    const user = await this.findOrCreateUser('telegram', {
      providerId: id,
      email: username ? `${username}@telegram` : undefined,
      firstName,
      lastName: lastName || '',
      profileImg: photoUrl,
    });

    // Generate tokens
    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      phoneNumber: user.phone_number,
      firstName: user.first_name,
      lastName: user.last_name,
      isVerified: user.is_verified,
      authProvider: 'telegram',
    });

    // Update refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // Refresh tokens
  async refreshTokens(userId: number, refreshToken: string) {
    const [user, authMethods] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
      }),
      this.prisma.$queryRaw`
        SELECT * FROM "auth_method" 
        WHERE "userId" = ${userId} AND "isPrimary" = true
        LIMIT 1;
      ` as Promise<any[]>,
    ]);

    const primaryAuthMethod = authMethods?.[0];
    if (!user || !primaryAuthMethod?.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      primaryAuthMethod.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    // Generate new tokens
    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      phoneNumber: user.phone_number,
      firstName: user.first_name,
      lastName: user.last_name,
      isVerified: user.is_verified,
      authProvider: primaryAuthMethod.provider as AuthProvider,
    });

    // Update refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // Logout
  async logout(userId: number) {
    await this.prisma.$executeRaw`
      UPDATE "auth_method" 
      SET "refreshToken" = NULL
      WHERE "userId" = ${userId} AND "isPrimary" = true;
    `;
  }

  // Helper method to verify SMS code (placeholder)
  private async verifySmsCode(phoneNumber: string, code: string): Promise<boolean> {
    // TODO: Implement actual SMS verification with your SMS provider
    // This is a placeholder that always returns true for testing
    return true;
  }
}
