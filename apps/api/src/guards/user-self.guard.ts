import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class UserSelfGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    if (req.params.id != req.user.id) {
      throw new ForbiddenException();
    }

    return true;
  }
}
