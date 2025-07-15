import {
  createParamDecorator,
  ExecutionContext,
} from "@nestjs/common";
import { JwtPayload } from "../types";

export const GetCurrentUserIdOptional = createParamDecorator(
  (_: undefined, context: ExecutionContext): number | undefined => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // User bo'lmasa undefined qaytarish, exception tashlamaslik
    return user?.id;
  }
);
