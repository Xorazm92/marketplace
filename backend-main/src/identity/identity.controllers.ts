import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserGuard } from '../guards/user.guard';
import { AdminGuard } from '../guards/admin.guard';
import { SuperAdminGuard } from '../guards/superAdmin.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';
import { CurrentAdminId } from '../decorators/current-admin-id.decorator';
import { UserAuthService } from './user-auth.service';
import { AdminAuthService } from './admin-auth.service';
import {
  AdminLoginDto,
  CreateAdminDto,
  RefreshDto,
  SendOtpDto,
  SetActiveDto,
  UpdateProfileDto,
  VerifyOtpDto,
} from './dto';

// Kirish endpoint'lari parol/kod tanlashga qarshi IP bo'yicha qattiqroq cheklanadi.
const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@ApiTags('Auth')
@Controller('auth')
export class UserAuthController {
  constructor(private readonly auth: UserAuthService) {}

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_THROTTLE)
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.phone_number);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_THROTTLE)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refresh_token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  logout(@GetCurrentUserId() userId: number) {
    return this.auth.logout(userId);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  me(@GetCurrentUserId() userId: number) {
    return this.auth.me(userId);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  updateMe(@GetCurrentUserId() userId: number, @Body() dto: UpdateProfileDto) {
    return this.auth.updateMe(userId, dto);
  }
}

@ApiTags('Admin auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly auth: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_THROTTLE)
  login(@Body() dto: AdminLoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refresh_token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  logout(@CurrentAdminId() adminId: number) {
    return this.auth.logout(adminId);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  me(@CurrentAdminId() adminId: number) {
    return this.auth.me(adminId);
  }
}

@ApiTags('Admin auth')
@ApiBearerAuth()
@Controller('admin/admins')
@UseGuards(AdminGuard, SuperAdminGuard)
export class AdminAccountsController {
  constructor(private readonly auth: AdminAuthService) {}

  @Get()
  list() {
    return this.auth.list();
  }

  @Post()
  create(@Body() dto: CreateAdminDto) {
    return this.auth.create(dto);
  }

  @Patch(':id/active')
  setActive(
    @CurrentAdminId() actorId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetActiveDto,
  ) {
    return this.auth.setActive(actorId, id, dto.is_active);
  }
}
