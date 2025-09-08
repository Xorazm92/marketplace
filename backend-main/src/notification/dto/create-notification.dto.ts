import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Notification title', example: 'Order Confirmed' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message', example: 'Your order #12345 has been confirmed' })
  @IsString()
  message: string;

  @ApiProperty({ 
    description: 'Notification type',
    enum: ['ORDER', 'PAYMENT', 'PRODUCT', 'SYSTEM', 'PROMOTION', 'SECURITY'],
    example: 'ORDER'
  })
  @IsEnum(['ORDER', 'PAYMENT', 'PRODUCT', 'SYSTEM', 'PROMOTION', 'SECURITY'])
  type: string;

  @ApiProperty({ 
    description: 'Notification channel',
    enum: ['PUSH', 'EMAIL', 'SMS', 'IN_APP'],
    example: 'IN_APP'
  })
  @IsEnum(['PUSH', 'EMAIL', 'SMS', 'IN_APP'])
  channel: string;

  @ApiProperty({ description: 'User ID to send notification to', example: 1 })
  @IsNumber()
  @Type(() => Number)
  user_id: number;

  @ApiProperty({ description: 'Action URL for notification', required: false })
  @IsOptional()
  @IsString()
  action_url?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  metadata?: any;

  @ApiProperty({ description: 'Schedule notification for later', required: false })
  @IsOptional()
  @IsDateString()
  scheduled_at?: string;
}

export class BulkNotificationDto {
  @ApiProperty({ description: 'Notification title', example: 'System Maintenance' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message', example: 'System will be down for maintenance' })
  @IsString()
  message: string;

  @ApiProperty({ 
    description: 'Notification type',
    enum: ['ORDER', 'PAYMENT', 'PRODUCT', 'SYSTEM', 'PROMOTION', 'SECURITY'],
    example: 'SYSTEM'
  })
  @IsEnum(['ORDER', 'PAYMENT', 'PRODUCT', 'SYSTEM', 'PROMOTION', 'SECURITY'])
  type: string;

  @ApiProperty({ 
    description: 'Notification channel',
    enum: ['PUSH', 'EMAIL', 'SMS', 'IN_APP'],
    example: 'IN_APP'
  })
  @IsEnum(['PUSH', 'EMAIL', 'SMS', 'IN_APP'])
  channel: string;

  @ApiProperty({ description: 'User IDs to send notification to', type: [Number] })
  @IsNumber({}, { each: true })
  @Type(() => Number)
  user_ids: number[];

  @ApiProperty({ description: 'Action URL for notification', required: false })
  @IsOptional()
  @IsString()
  action_url?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  metadata?: any;

  @ApiProperty({ description: 'Schedule notification for later', required: false })
  @IsOptional()
  @IsDateString()
  scheduled_at?: string;
}

export class MarkAsReadDto {
  @ApiProperty({ description: 'Mark as read', example: true })
  @IsBoolean()
  is_read: boolean;
}
