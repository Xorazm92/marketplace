import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// Global: har bir modul PrismaModule ni qayta import qilmasin.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
