import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { ResponseFields } from "../types";
import { CookieGetter } from "../decorators/cookie-getter.decorator";
import { AdminSignInDto, CreateAdminDto } from "../admin/dto";
import { AdminGuard } from "../guards/admin.guard";
import { SuperAdminGuard } from "../guards/superAdmin.guard";
import { UserAuthService } from "../user-auth/user-auth.service";
import { SingUpUserDto } from "../user-auth/dto/sign-up-user.dto";
import { UserLoginDto } from "../user-auth/dto/user-login.dto";
import { RefreshTokenDto } from "../user-auth/dto/refresh-token.dto";

@ApiTags("🔐 Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userAuthService: UserAuthService
  ) {}


  @ApiOperation({ summary: "Register a new admin" })
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard, SuperAdminGuard)
  @Post("admin/sign-up")
  signUpAdmin(@Body() createAdminDto: CreateAdminDto) {    
    return this.authService.adminSignUp(createAdminDto);
  }

  @ApiOperation({ summary: "Login to admin panel" })
  @HttpCode(HttpStatus.OK)
  @Post("admin/sign-in")
  adminSignIn(
    @Body() adminSignInDto: AdminSignInDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<ResponseFields> {
    return this.authService.adminSignIn(adminSignInDto, res);
  }

  @ApiOperation({ summary: "Logout from admin panel" })
  @Get("admin/sign-out")
  AdminSignout(
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.AdminSignOut(refreshToken, res);
  }

  @ApiOperation({ summary: "Refresh admin token" })
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard)
  @Get("admin/:id/refresh")
  AdminRefresh(
    @Param("id") id: number,
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<ResponseFields> {
    return this.authService.AdminRefreshToken(+id, refreshToken, res);
  }

  @ApiOperation({ summary: "Activate admin" })
  @ApiBearerAuth('inbola')
  @Get("admin/activate/:link")
  activateAdmin(@Param("link") link: string) {
    return this.authService.activateAdmin(link);
  }

  // User Authentication Endpoints
  @ApiOperation({ summary: "Register a new user" })
  @Post("user/sign-up")
  userSignUp(
    @Body() dto: SingUpUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.userAuthService.signUp(dto, res);
  }

  @ApiOperation({ summary: "User login" })
  @HttpCode(HttpStatus.OK)
  @Post("user/login")
  userLogin(
    @Body() dto: UserLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.userAuthService.login(dto, res);
  }

  @ApiOperation({ summary: "Refresh user token" })
  @Post("user/refresh")
  refreshUserToken(
    @Body() body: RefreshTokenDto,
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.userAuthService.refreshToken(body.userId, refreshToken, res);
  }

  @ApiOperation({ summary: "User sign out" })
  @Post("user/sign-out")
  userSignOut(
    @Body() body: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.userAuthService.signOut(body.userId, res);
  }
}
