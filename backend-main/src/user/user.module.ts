import { Module } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { UserTokenService } from "./user-token.service";
import { PasswordService } from "./password.service";

import { UserService } from "./user.service";

import { UserController } from "./user.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, PasswordService, UserTokenService],
  exports: [UserService, UserRepository, PasswordService, UserTokenService],
})
export class UserModule {}
