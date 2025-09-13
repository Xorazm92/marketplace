import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const baseUrl = configService.get<string>('API_URL') || 'http://localhost:4000';
    const callbackPath = '/api/v1/auth/google/callback';
    const callbackURL = `${baseUrl}${callbackPath}`;

    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL,
      scope: ['email', 'profile', 'openid'],
      passReqToCallback: true,
      state: true,
    });
  }

  async validate(
    request: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, displayName, emails, photos } = profile;

      if (!emails || !emails[0]?.value) {
        return done(new Error('No email found in Google profile'), false);
      }

      const user = {
        provider: 'google',
        providerId: id,
        email: emails[0].value,
        name: displayName,
        photo: photos?.[0]?.value || null,
        accessToken,
      };

      done(null, user);
    } catch (error) {
      console.error('Google OAuth Error:', error);
      done(error, false);
    }
  }
}

