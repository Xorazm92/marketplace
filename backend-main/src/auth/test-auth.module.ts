import { Module } from '@nestjs/common';
import { TestGoogleAuthController } from './test-google-auth.controller';
import { TelegramAuthController } from './telegram-auth.controller';
import { TelegramAuthService } from './telegram-auth.service';
import { UnifiedAuthModule } from './unified-auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [UnifiedAuthModule, PrismaModule],
  controllers: [TestGoogleAuthController, TelegramAuthController],
  providers: [TelegramAuthService],
  exports: [TelegramAuthService],
})
export class TestAuthModule {}
