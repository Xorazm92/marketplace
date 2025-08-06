import { Controller, Post, Body, Res, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { Response } from "express";
import { UserAuthService } from "./user-auth.service";
import { SingUpUserDto } from "./dto/sign-up-user.dto";
import { UserLoginDto } from "./dto/user-login.dto";
import { GetCurrentUserId } from "../decorators/get-current-user-id.decorator";
import { CookieGetter } from "../decorators/cookie-getter.decorator";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@ApiTags("User Authentication")
@Controller("user-auth")
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post("sign-up")
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: SingUpUserDto })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid input or user already exists",
  })
  signUp(
    @Body() dto: SingUpUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.userAuthService.signUp(dto, res);
  }

  @Post("login")
  @ApiOperation({ summary: "Authenticate a user and return tokens" })
  @ApiBody({ type: UserLoginDto })
  @ApiResponse({
    status: 200,
    description: "Login successful, tokens returned",
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  login(@Body() dto: UserLoginDto, @Res({ passthrough: true }) res: Response) {
    return this.userAuthService.login(dto, res);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token using refresh token cookie" })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({ status: 401, description: "Invalid or expired refresh token" })
  refreshUserToken(
    @Body() body: RefreshTokenDto,
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.userAuthService.refreshToken(body.userId, refreshToken, res);
  }

  @Post("sign-out")
  @ApiOperation({ summary: "User sign out and clear refresh token cookie" })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: "Successfully signed out" })
  @ApiResponse({ status: 401, description: "Unauthorized or invalid token" })
  signOut(
    @Body() body: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.userAuthService.signOut(body.userId, res);
  }
}
