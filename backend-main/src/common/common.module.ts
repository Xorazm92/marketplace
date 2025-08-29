import { Module, Global } from '@nestjs/common';
import { WinstonLoggerService } from './services/winston-logger.service';
import { SentryService } from './services/sentry.service';
import { SmsService } from './services/sms.service';

@Global()
@Module({
  providers: [
    WinstonLoggerService,
    SentryService,
    SmsService,
  ],
  exports: [
    WinstonLoggerService,
    SentryService,
    SmsService,
  ],
})
export class CommonModule {}
