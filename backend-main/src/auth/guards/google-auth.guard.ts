import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const callbackUrl = request.query?.callbackUrl as string;
    
    // Default callback URL if not provided
    const defaultCallback = `${request.protocol}://${request.get('host')}/auth/callback`;
    const redirectUrl = callbackUrl || defaultCallback;
    
    // Pass the callback URL through the state parameter
    return {
      ...super.getAuthenticateOptions?.(context),
      state: encodeURIComponent(JSON.stringify({
        callbackUrl: redirectUrl,
        // Add any additional state you need to preserve
      })),
      accessType: 'offline',
      prompt: 'consent',
    };
  }
}
