import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto, BulkNotificationDto, MarkAsReadDto } from './dto/create-notification.dto';
import { AdminGuard } from '../guards/admin.guard';
import { UserGuard } from '../guards/user.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('inbola')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // User notification endpoints
  @Get('my')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  async getMyNotifications(
    @GetCurrentUserId() userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('unreadOnly') unreadOnly?: boolean
  ) {
    const safePage = Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number(limit) > 0 ? Number(limit) : 20;
    const offset = (safePage - 1) * safeLimit;
    return this.notificationService.getUserNotifications(userId, {
      limit: safeLimit,
      offset,
      unreadOnly: Boolean(unreadOnly),
    });
  }

  @Get('my/unread-count')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@GetCurrentUserId() userId: number) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Put(':id/read')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number
  ) {
    return this.notificationService.markAsRead(id, userId);
  }

  @Put('mark-all-read')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@GetCurrentUserId() userId: number) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Delete notification' })
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number
  ) {
    return this.notificationService.deleteNotification(id, userId);
  }

  // Admin notification endpoints
  @Post('admin/create')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create notification (Admin)' })
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Post('admin/bulk')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create bulk notifications (Admin)' })
  async createBulkNotification(@Body() bulkNotificationDto: BulkNotificationDto) {
    return this.notificationService.createBulkNotification(bulkNotificationDto);
  }

  @Get('admin/all')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all notifications (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllNotifications(
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.notificationService.getAllNotifications(page || 1, limit || 20);
  }

  @Get('admin/stats')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get notification statistics (Admin)' })
  async getNotificationStats() {
    return this.notificationService.getNotificationStats();
  }

  @Post('admin/process-scheduled')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Process scheduled notifications (Admin)' })
  async processScheduledNotifications() {
    const processed = await this.notificationService.processScheduledNotifications();
    return { message: `Processed ${processed.length} scheduled notifications` };
  }
}
