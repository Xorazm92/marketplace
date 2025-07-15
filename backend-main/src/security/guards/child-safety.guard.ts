
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SecurityService } from '../security.service';

@Injectable()
export class ChildSafetyGuard implements CanActivate {
  constructor(private securityService: SecurityService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user is a child
    if (user?.role === 'child') {
      // Check time restrictions
      const currentHour = new Date().getHours();
      const parentalControls = user.parentalControls;

      if (parentalControls?.timeRestrictions) {
        const startHour = parseInt(parentalControls.timeRestrictions.start.split(':')[0]);
        const endHour = parseInt(parentalControls.timeRestrictions.end.split(':')[0]);

        if (currentHour < startHour || currentHour > endHour) {
          throw new ForbiddenException('Outside allowed time window');
        }
      }

      // Check spending limits
      if (parentalControls?.dailySpendLimit) {
        // This would need to be checked against daily spending
        // Implementation depends on order/spending tracking
      }
    }

    return true;
  }
}
