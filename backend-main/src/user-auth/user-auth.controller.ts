import { Controller, Post, Body, Res, UseGuards, Get, Req, UseFilters, Redirect } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiExcludeEndpoint } from "@nestjs/swagger";
import { Response, Request } from "express";
import { UserAuthService } from "./user-auth.service";
import { SingUpUserDto } from "./dto/sign-up-user.dto";
import { UserLoginDto } from "./dto/user-login.dto";
import { GetCurrentUserId } from "../decorators/get-current-user-id.decorator";
import { CookieGetter } from "../decorators/cookie-getter.decorator";
import { RefreshTokenRequestDto } from "./dto/refresh-token.dto";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";

@ApiTags("User Authentication")
@Controller("user-auth")
export class UserAuthController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly configService: ConfigService
  ) {}

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
  @ApiOperation({ summary: "Refresh access token using refresh token" })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({ status: 401, description: "Invalid or expired refresh token" })
  refreshUserToken(
    @Body() body: RefreshTokenRequestDto,
    @Res({ passthrough: true }) res: Response
  ) {
    // Prefer body.refreshToken; if absent, fallback to cookie via decorator in future
    return this.userAuthService.refreshByToken(body.refreshToken, res);
  }

  @Post("sign-out")
  @ApiOperation({ summary: "User sign out and clear refresh token cookie" })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiResponse({ status: 200, description: "Successfully signed out" })
  @ApiResponse({ status: 401, description: "Unauthorized or invalid token" })
  signOut(
    @Body() body: RefreshTokenRequestDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.userAuthService.signOut(body.refreshToken, res);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint()
  async googleAuth() {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  @ApiExcludeEndpoint()
  async googleAuthRedirect(@Req() req: Request) {
    const token = await this.userAuthService.googleLogin(req);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    return {
      url: `${frontendUrl}/auth/callback?token=${token.accessToken}`,
      statusCode: 302,
    };
  }
}
