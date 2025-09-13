
import { Module } from '@nestjs/common';
import { ChildSafetyService } from './child-safety.service';
import { ChildSafetyController } from './child-safety.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChildSafetyController],
  providers: [ChildSafetyService],
  exports: [ChildSafetyService],
})
export class ChildSafetyModule {}
