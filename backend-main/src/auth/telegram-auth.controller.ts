import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Logger,
  Get,
  UseGuards,
  Req
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { TelegramAuthService, TelegramUserData } from './telegram-auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class TelegramLoginDto implements TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

@ApiTags('auth')
@Controller('auth/telegram')
export class TelegramAuthController {
  private readonly logger = new Logger(TelegramAuthController.name);

  constructor(private readonly telegramAuthService: TelegramAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with Telegram' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated with Telegram' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: TelegramLoginDto })
  async login(@Body() data: TelegramLoginDto) {
    this.logger.log(`Telegram login attempt for user: ${data.id}`);
    return this.telegramAuthService.authenticate(data);
  }

  @Get('bot-username')
  @ApiOperation({ summary: 'Get Telegram bot username' })
  @ApiResponse({ status: 200, description: 'Returns the bot username' })
  async getBotUsername() {
    return this.telegramAuthService.getBotUsername();
  }

  @UseGuards(JwtAuthGuard)
  @Get('test-auth')
  @ApiOperation({ summary: 'Test protected Telegram auth endpoint' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  testAuth(@Req() req: any) {
    return { 
      message: 'Successfully authenticated with Telegram',
      user: req.user 
    };
  }
}
