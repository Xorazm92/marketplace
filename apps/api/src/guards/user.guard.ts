import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException("Unauthorizard1 user");
    }
    const bearer = authHeader.split(" ")[0];
    const token = authHeader.split(" ")[1];
    
    if (bearer != "Bearer" || !token) {
      throw new UnauthorizedException("Unauthorizard2 user");
    }
    async function verify(token: string, jwtService: JwtService) {
      let payload: any;
      try {
        payload = await jwtService.verify(token, {
          secret: process.env.ACCESS_TOKEN_KEY,
        });
      } catch (error) {
        console.log(error);
        throw new UnauthorizedException("Unauthorizard3 user");
      }
      if (!payload) {
        throw new UnauthorizedException("Unauthorizard4 user");
      }
      req.user = payload;      
      return true;
    }
    return verify(token, this.jwtService);
  }
}
