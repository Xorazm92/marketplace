import { Controller, Get, Req, UseGuards, Query, Redirect } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { UnifiedAuthService } from './unified-auth.service';
import { ConfigService } from '@nestjs/config';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth/google')
@Public()
export class GoogleAuthController {
  constructor(
    private readonly unifiedAuthService: UnifiedAuthService,
    private readonly configService: ConfigService,
  ) {}

  // Step 1: Redirect user to Google
  @Get()
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Query('callbackUrl') callbackUrl?: string) {
    // The actual redirection happens in the GoogleAuthGuard
    return { message: 'Redirecting to Google...' };
  }

  // Step 2: Google redirects back to our callback
  @Get('callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async googleAuthCallback(
    @Req() req: Request & { user?: any },
    @Query('state') state?: string,
    @Query('error') error?: string,
  ) {
    // Handle OAuth errors
    if (error) {
      const errorUrl = this.getErrorRedirectUrl(state, error);
      return { url: errorUrl };
    }

    // Get the user from the request (set by GoogleStrategy.validate)
    const gUser = req.user;
    if (!gUser) {
      return { url: this.getErrorRedirectUrl(state, 'access_denied') };
    }

    // Get the original callback URL from state
    let callbackUrl = '';
    try {
      const stateObj = state ? JSON.parse(decodeURIComponent(state)) : {};
      callbackUrl = stateObj.callbackUrl || '';
    } catch (e) {
      console.error('Error parsing state:', e);
    }

    const defaultCallback = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const baseUrl = callbackUrl || defaultCallback;

    try {
      // Process the user login/registration
      const tokens = await this.unifiedAuthService.googleLogin({
        providerId: gUser.providerId,
        email: gUser.email || undefined,
        firstName: gUser.name?.split(' ')[0] || 'User',
        lastName: gUser.name?.split(' ').slice(1).join(' ') || '',
        profileImg: gUser.photo || undefined,
      });

      // Redirect to frontend with tokens
      const redirectUrl = new URL(baseUrl);
      redirectUrl.searchParams.set('token', tokens.accessToken);
      if (tokens.refreshToken) {
        redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
      }
      redirectUrl.searchParams.set('provider', 'google');

      return { url: redirectUrl.toString() };
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      return { url: this.getErrorRedirectUrl(state, 'server_error') };
    }
  }

  private getErrorRedirectUrl(state: string | undefined, error: string): string {
    const defaultUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    let redirectUrl = defaultUrl;
    
    try {
      if (state) {
        const stateObj = JSON.parse(decodeURIComponent(state));
        if (stateObj.callbackUrl) {
          redirectUrl = stateObj.callbackUrl;
        }
      }
    } catch (e) {
      console.error('Error parsing state:', e);
    }

    const url = new URL(redirectUrl);
    url.searchParams.set('error', error);
    return url.toString();
  }
}
