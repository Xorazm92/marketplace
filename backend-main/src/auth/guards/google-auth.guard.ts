import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const callbackUrl = (request.query?.callbackUrl as string) || undefined;
    // Pass callbackUrl through OAuth state parameter
    const baseOptions = super.getAuthenticateOptions?.(context) || {};
    return {
      ...baseOptions,
      state: callbackUrl ? encodeURIComponent(callbackUrl) : baseOptions.state,
    } as Record<string, any>;
  }
}
