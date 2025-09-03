import { Body, Controller, Get, Post, Req, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { EmailSignInDto } from './dto/email-signin.dto';
import { EmailSignUpDto } from './dto/email-signup.dto';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { UserAuthService } from './user-auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '@prisma/client';
import { ApiAuthTags } from '../common/decorators/api-tags.decorator';
import { ApiBearerAuth, ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Authentication')
@Controller('auth/user')
export class UserAuthController {
  constructor(private readonly authService: UserAuthService) {}

  @Post('signup/email')
  @ApiOperation({ summary: 'Register a new user with email' })
  @ApiBody({ type: EmailSignUpDto })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User successfully registered. Please check your email to verify your account.',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'User with this email already exists' 
  })
  async signUpWithEmail(@Body() signUpDto: EmailSignUpDto) {
    return this.authService.signUpWithEmail(signUpDto);
  }

  @Post('signin/email')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: EmailSignInDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User successfully logged in',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid credentials or email not verified' 
  })
  async signInWithEmail(
    @Body() signInDto: EmailSignInDto,
  ) {
    return this.authService.signInWithEmail(signInDto);
  }

  @Post('telegram')
  @ApiOperation({ summary: 'Authenticate with Telegram' })
  @ApiBody({ type: TelegramAuthDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully authenticated with Telegram',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid Telegram authentication data' 
  })
  async authWithTelegram(@Body() telegramDto: TelegramAuthDto) {
    return this.authService.authenticateWithTelegram(telegramDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully refreshed token',
    type: RefreshTokenDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid or expired refresh token' 
  })
  @ApiCookieAuth('refresh_token')
  async refreshTokens(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }
    
    const decoded = this.authService.verifyRefreshToken(refreshToken);
    const tokens = await this.authService.refreshTokens(decoded.sub, refreshToken);
    
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
    });
    
    return { access_token: tokens.accessToken };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out user' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully logged out' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized' 
  })
  async logout(@GetUser() user: User) {
    return this.authService.logout(user.id);
  }

  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Email successfully verified' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid or expired verification token' 
  })
  async verifyEmail(@Req() req: any) {
    const { token } = req.params;
    return this.authService.verifyEmail(token);
  }
}
