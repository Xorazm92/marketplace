import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const apiUrl =
      configService.get<string>('GOOGLE_CALLBACK_URL') ||
      `${computeFallbackApiUrl(configService)}/auth/google/callback`;

    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: apiUrl,
      scope: ['email', 'profile'],
      passReqToCallback: true,
      state: true,
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, displayName, emails, photos } = profile;

    const user = {
      provider: 'google',
      providerId: id,
      email: emails?.[0]?.value || null,
      name: displayName,
      photo: photos?.[0]?.value || null,
      accessToken,
    };

    done(null, user);
  }
}

function computeFallbackApiUrl(configService: ConfigService): string {
  const api = configService.get<string>('API_URL');
  if (api) return api;
  const port = configService.get<string>('PORT') || '3001';
  return `http://localhost:${port}`;
}
