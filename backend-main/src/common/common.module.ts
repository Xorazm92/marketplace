import { Module, Global } from '@nestjs/common';
import { WinstonLoggerService } from './services/winston-logger.service';
import { SentryService } from './services/sentry.service';

@Global()
@Module({
  providers: [
    WinstonLoggerService,
    SentryService,
  ],
  exports: [
    WinstonLoggerService,
    SentryService,
  ],
})
export class CommonModule {}
