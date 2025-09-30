// @ts-nocheck
import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await // @ts-ignore
    this.prisma.user.findFirst({
      where: { 
        email: {
          some: {
            email: email
          }
        }
      },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await // @ts-ignore
    this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async getProfile(userId: number) {
    return // @ts-ignore
    this.prisma.user.findUnique({
      where: { id: (userId as any) },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone_numbers: true,
        profile_img: true,
        createdAt: true,
      },
    });
  }
}
