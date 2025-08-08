// user-token.service.ts

import { Injectable } from "@nestjs/common";
import { Response } from "express";
import * as bcrypt from "bcrypt";
import { BCRYPT_SALT, COOKIE_MAX_AGE } from "../auth/auth.constants"; // reuse auth constants
import { JwtService } from "@nestjs/jwt";
import { UserService } from "./user.service";

/**
 * Service responsible for handling user token operations.
 * This mirrors AuthTokenService but works with the User domain.
 */
@Injectable()
export class UserTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  /** Generate tokens for a user (placeholder implementation) */
  async generateTokens(user: any) {
    // In a real implementation, you would generate JWTs here.
    // For now, delegate to userService if it has a method, otherwise return dummy tokens.
    if (typeof (this.userService as any).getToken === "function") {
      return (this.userService as any).getToken(user);
    }
    return { access_token: "access", refresh_token: "refresh" };
  }

  /** Hash a refresh token */
  async hashRefreshToken(refreshToken: string) {
    return bcrypt.hash(refreshToken, BCRYPT_SALT);
  }

  /** Persist hashed refresh token */
  async persistRefreshToken(userId: number, hashedToken: string | undefined) {
    // Assuming UserService has a method to update refresh token
    if (typeof (this.userService as any).updateUserRefreshToken === "function") {
      return (this.userService as any).updateUserRefreshToken(userId, hashedToken);
    }
    return null;
  }

  /** Set refresh token cookie */
  setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie("refresh_token", refreshToken, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
    });
  }

  /** Clear refresh token cookie */
  clearRefreshCookie(res: Response) {
    res.clearCookie("refresh_token");
  }
}
