import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException("Unauthorizard admin");
    }
    const bearer = authHeader.split(" ")[0];
    const token = authHeader.split(" ")[1];

    if (bearer != "Bearer" || !token) {
      throw new UnauthorizedException("Unauthorizard admin");
    }

    return this.verify(token, req);
  }

  private async verify(token: string, req: any): Promise<boolean> {
    let payload: any;
    try {
      payload = await this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_KEY,
      });
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException("Unauthorizard admin");
    }
    if (!payload) {
      throw new UnauthorizedException("Unauthorizard admin");
    }
    if (payload.role != "admin") {
      throw new UnauthorizedException("Unauthorizard admin");
    }

    req.admin = payload;

    return true;
  }
}
