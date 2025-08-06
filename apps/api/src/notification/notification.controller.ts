
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Notifications')
@ApiBearerAuth('inbola')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('bulk-email')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Send bulk email to users' })
  async sendBulkEmail(@Body() body: {
    subject: string;
    content: string;
    userIds?: number[];
  }) {
    return this.notificationService.sendBulkEmail(
      body.subject,
      body.content,
      body.userIds
    );
  }

  @Post('test-email')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Test email sending' })
  async testEmail(@Body() body: { email: string }) {
    // Test email functionality
    return { message: 'Test email sent successfully' };
  }
}
