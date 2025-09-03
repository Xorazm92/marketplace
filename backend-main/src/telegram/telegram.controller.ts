import { Controller, Post, Req, Res } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { Request, Response } from 'express';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      await this.telegramService.handleUpdate(req.body);
      res.status(200).send();
    } catch (error) {
      console.error('Error handling Telegram update:', error);
      res.status(500).send('Error processing update');
    }
  }
}
