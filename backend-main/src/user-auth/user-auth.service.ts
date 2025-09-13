import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserAuthDto } from "./dto/create-user-auth.dto";
import { UpdateUserAuthDto } from "./dto/update-user-auth.dto";
import { UserService } from "../user/user.service";
import { SingUpUserDto } from "./dto/sign-up-user.dto";
import { IResponse, JwtPayload } from "../types";
import { JwtService } from "@nestjs/jwt";
import { BcryptEncryption } from "../utils/bcryptService";
import { OtpService } from "../otp/otp.service";
import { UserLoginDto } from "./dto/user-login.dto";
import { PrismaService } from "../prisma/prisma.service";
import { Response } from "express";
import { decode } from "../utils/otp-crypto/crypto";
import { Request } from 'express';
@Injectable()
export class UserAuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private prisma: PrismaService
  ) {}

  async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async signUp(dto: SingUpUserDto, res: Response): Promise<IResponse> {
    // check user exist
    const { phone_number, first_name, last_name } = dto;
    const isExist = await this.userService.findUserByPhoneNumber(
      dto.phone_number
    );

    if (isExist) {
      throw new BadRequestException("User already exist with this number");
    }

    const is_verified = await decode(dto.verified_key);
    const details = JSON.parse(is_verified);

    if (details.phone_number != dto.phone_number) {
      throw new ForbiddenException("Please verify your phone number");
    }

    const newUser = await this.userService.create(dto);

    const { accessToken, refreshToken } = await this.generateTokens({
      id: newUser.id,
      phone_number,
    });

    const hashed_refresh_token = await BcryptEncryption.encrypt(refreshToken);
    await this.userService.updateUserRefreshToken(
      newUser.id,
      hashed_refresh_token
    );

    res.cookie("refresh_token", refreshToken, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return {
      data: {
        id: newUser.id,
        phone_number,
        full_name: `${first_name} ${last_name}`,
        accessToken,
      },
      message: "Succfully registered",
      status_code: 200,
    };
  }

  async login(dto: UserLoginDto, res: Response): Promise<IResponse> {
    const { phone_number, password } = dto;
    const user = await this.userService.findUserByPhoneNumber(phone_number);

    if (!user) {
      throw new NotFoundException("Phone or password is no valid");
    }
    const { password: user_hashed_password, id } = user;

    const compared_password = await BcryptEncryption.compare(
      dto.password,
      user_hashed_password
    );

    if (!compared_password) {
      throw new NotFoundException("Phone or password is no valid");
    }

    if (!user.is_active) {
      throw new BadRequestException(
        "You are not active please active your account"
      );
    }

    const { accessToken, refreshToken } = await this.generateTokens({
      id,
      phone_number,
    });

    const hashed_refresh_token = await BcryptEncryption.encrypt(refreshToken);
    await this.userService.updateUserRefreshToken(
      user.id,
      hashed_refresh_token
    );

    res.cookie("refresh_token", refreshToken, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    console.log(user.id)
    return {
      data: {
        id: user.id,
        phone_number,
        full_name: `${user.first_name} ${user.last_name}`,
        accessToken,
      },
      message: "Succfully login",
      status_code: 200,
    };
  }

  async refreshByToken(refreshToken: string, res: Response) {
    let payload: any;
    try {
      payload = await this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new ForbiddenException("Invalid or expired refresh token");
    }

    const userId = payload?.id ?? payload?.sub;
    if (!userId) {
      throw new ForbiddenException("Invalid refresh token payload");
    }

    const user = await this.userService.findOneById(userId);
    if (!user || !user.hashed_refresh_token) {
      throw new NotFoundException("User not found");
    }

    const tokenMatch = await BcryptEncryption.compare(
      refreshToken,
      user.hashed_refresh_token
    );
    if (!tokenMatch) {
      throw new ForbiddenException("Refresh token does not match");
    }

    if (!user.phone_number) {
      throw new NotFoundException("Phone number not found for user");
    }

    const { accessToken, refreshToken: newRefresh } = await this.generateTokens({
      id: user.id,
      phone_number: user.phone_number,
    });

    const hashed_refresh_token = await BcryptEncryption.encrypt(newRefresh);

    await this.userService.updateUserRefreshToken(
      user.id,
      hashed_refresh_token
    );

    res.cookie("refresh_token", newRefresh, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return {
      data: {
        accessToken,
      },
      message: "Successfully refreshed token",
      status_code: 200,
    };
  }

  async signOut(refreshToken: string, res: Response) {
    let payload: any;
    try {
      payload = await this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new ForbiddenException("Invalid or expired refresh token");
    }

    const userId = payload?.id ?? payload?.sub;
    if (!userId) {
      throw new ForbiddenException("Invalid refresh token payload");
    }

    const isUpdated = await this.userService.updateUserRefreshToken(userId, "");
    if (!isUpdated) {
      throw new InternalServerErrorException("Error signing out");
    }

    res.clearCookie("refresh_token", { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return { message: "Successfully signed out", status_code: 200 };
  }

  async googleLogin(req: Request) {
    if (!req.user) {
      throw new BadRequestException('No user from Google');
    }

    const { email, name, picture } = req.user as any;
    
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create a new one
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          first_name: name,
          last_name: '',
          phone_number: '', // You might want to handle this differently
          is_verified: true, // Mark as verified since it's from Google
          profile_img: picture,
          password: '', // Required field, but we'll handle it differently for OAuth users
          telegram_id: '', // Required field
        },
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens({
      id: user.id,
      phone_number: user.phone_number || '',
      email: user.email,
      is_verified: user.is_verified,
      sub: user.id.toString()
      // role is not included as it's not part of the user model
    } as any); // Using 'as any' to bypass type checking temporarily

    // Update refresh token in database using the service method
    await this.userService.updateUserRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}
