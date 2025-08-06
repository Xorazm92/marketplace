
import { Module } from '@nestjs/common';
import { ChildSafetyService } from './child-safety.service';

@Module({
  providers: [ChildSafetyService],
  exports: [ChildSafetyService],
})
export class ChildSafetyModule {}
