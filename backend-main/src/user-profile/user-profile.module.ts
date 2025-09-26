import { Module } from '@nestjs/common';
import { UserProfileController } from './user-profile.controller';
import { UserProfileService } from './user-profile.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserProfileController],
  providers: [UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}
