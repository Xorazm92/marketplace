import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SuperAdminGuard implements CanActivate {

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();

        if(!req.admin.is_creator){
            throw new ForbiddenException()
        }

        return true
    }
}
