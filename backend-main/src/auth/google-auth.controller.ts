import { Controller, Get, Req, Res, UseGuards, Query } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { UnifiedAuthService } from './unified-auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private readonly unifiedAuthService: UnifiedAuthService,
    private readonly configService: ConfigService,
  ) {}

  // Step 1: Redirect user to Google
  @Get()
  @UseGuards(GoogleAuthGuard as unknown as typeof AuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth() {}

  // Step 2: Google redirects back to our callback
  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request & { user?: any },
    @Res() res: Response,
    @Query('state') state?: string,
  ) {
    // Extract callback URL from state (if provided)
    const defaultCallback = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/auth/callback`;
    const callbackUrl = state ? decodeURIComponent(state) : defaultCallback;

    // User object is provided by GoogleStrategy.validate
    const gUser = req.user as
      | {
          provider: 'google';
          providerId: string;
          email: string | null;
          name: string;
          photo: string | null;
          accessToken: string;
        }
      | undefined;

    if (!gUser) {
      const redirect = `${callbackUrl}?error=${encodeURIComponent('access_denied')}`;
      return res.redirect(redirect);
    }

    const [firstName, ...rest] = (gUser.name || '').split(' ');
    const lastName = rest.join(' ').trim();

    // Issue our own tokens and link or create user
    const tokens = await this.unifiedAuthService.googleLogin({
      providerId: gUser.providerId,
      email: gUser.email || undefined,
      firstName: firstName || 'User',
      lastName: lastName || '',
      profileImg: gUser.photo || undefined,
    });

    // Redirect back to frontend callback with tokens
    const redirect = `${callbackUrl}?token=${encodeURIComponent(
      tokens.accessToken,
    )}&refreshToken=${encodeURIComponent(tokens.refreshToken)}`;

    return res.redirect(redirect);
  }
}
