import { Module } from '@nestjs/common';
import { PhoneNumberService } from './phone_number.service';
import { PhoneNumberController } from './phone_number.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PhoneNumberController],
  providers: [PhoneNumberService],
})
export class PhoneNumberModule {}
