import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: TelegramBot;
  private readonly webhookUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const token = this.configService.get('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
    }
    
    this.bot = new TelegramBot(token);
    this.webhookUrl = `${this.configService.get('APP_URL')}/telegram/webhook`;
  }

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') {
      await this.setupWebhook();
    }
    this.setupCommands();
  }

  private async setupWebhook() {
    try {
      // In production, we'll use webhooks
      if (process.env.NODE_ENV === 'production') {
        await this.bot.setWebHook(this.webhookUrl);
        console.log(`Webhook set to: ${this.webhookUrl}`);
      } else {
        // In development, we'll use polling
        this.bot.deleteWebHook();
        this.bot.startPolling();
        console.log('Bot is running in polling mode');
      }
    } catch (error) {
      console.error('Error setting up Telegram bot:', error);
    }
  }

  private setupCommands() {
    // Start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        '👋 Welcome to Kids Marketplace! Use /auth to authenticate your account.'
      );
    });

    // Auth command
    this.bot.onText(/\/auth/, (msg) => {
      const chatId = msg.chat.id;
      const authUrl = `${this.configService.get('FRONTEND_URL')}/telegram-auth?from=bot`;
      
      this.bot.sendMessage(chatId, `🔑 To authenticate, please visit: ${authUrl}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔑 Authenticate', url: authUrl }]
          ]
        }
      });
    });

    // Help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        '🤖 *Available Commands:*\n' +
        '/start - Start the bot\n' +
        '/auth - Authenticate your account\n' +
        '/help - Show this help message',
        { parse_mode: 'Markdown' }
      );
    });
  }

  // Handle webhook updates
  async handleUpdate(update: any) {
    this.bot.processUpdate(update);
  }

  // Send notification to user
  async sendNotification(telegramId: string, message: string) {
    try {
      await this.bot.sendMessage(telegramId, message);
      return true;
    } catch (error) {
      console.error(`Failed to send message to ${telegramId}:`, error);
      return false;
    }
  }

  // Get bot info
  async getBotInfo() {
    return this.bot.getMe();
  }
}
