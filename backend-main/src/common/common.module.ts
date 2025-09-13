import { Module, Global } from '@nestjs/common';
import { WinstonLoggerService } from './services/winston-logger.service';
import { SentryService } from './services/sentry.service';
import { SmsService } from './services/sms.service';
import { ValidationService } from './services/validation.service';
import { MonitoringService } from './services/monitoring.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    WinstonLoggerService,
    SentryService,
    SmsService,
    ValidationService,
    MonitoringService,
  ],
  exports: [
    WinstonLoggerService,
    SentryService,
    SmsService,
    ValidationService,
    MonitoringService,
  ],
})
export class CommonModule {}