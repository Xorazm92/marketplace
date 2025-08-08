// auth-token.service.ts

import { Injectable } from "@nestjs/common";
import { Response } from "express";
import * as bcrypt from "bcrypt";
import { BCRYPT_SALT, COOKIE_MAX_AGE } from "./auth.constants";
import { JwtService } from "@nestjs/jwt";
import { AdminService } from "../admin/admin.service";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Service responsible for handling token generation, hashing, persistence and cookie management.
 * This separates token‑related concerns from the main AuthService, making the code easier to test and extend.
 */
@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
    private readonly prismaService: PrismaService,
  ) {}

  /** Generate access and refresh tokens using AdminService */
  async generateTokens(admin: any) {
    // AdminService already provides a method to get tokens
    return this.adminService.getToken(admin);
  }

  /** Hash a refresh token before storing it */
  async hashRefreshToken(refreshToken: string) {
    return bcrypt.hash(refreshToken, BCRYPT_SALT);
  }

  /** Persist hashed refresh token for the admin */
  async persistRefreshToken(adminId: number, hashedToken: string | null) {
    return this.adminService.updateRefreshToken(adminId, hashedToken);
  }

  /** Set refresh token cookie on response */
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
