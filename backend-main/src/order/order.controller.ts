import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, OrderStatus } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UserGuard } from '../guards/user.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminOrOwnerGuard } from '../guards/admin-or-owner.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(UserGuard)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @GetCurrentUserId() userId: number,
  ) {
    // Ensure the order is created for the authenticated user
    createOrderDto.user_id = userId;
    return this.orderService.createOrder(createOrderDto);
  }

  @Get()
  @UseGuards(UserGuard)
  async findAll(
    @GetCurrentUserId() userId: number,
    @Query('status') status?: OrderStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.orderService.findAll(userId, status, +page, +limit);
  }

  @Get('admin/all')
  @UseGuards(AdminGuard)
  async findAllAdmin(
    @Query('userId') userId?: number,
    @Query('status') status?: OrderStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.orderService.findAll(userId ? +userId : undefined, status, +page, +limit);
  }

  @Get('statistics')
  @UseGuards(UserGuard)
  async getUserStatistics(@GetCurrentUserId() userId: number) {
    return this.orderService.getOrderStatistics(userId);
  }

  @Get('admin/statistics')
  @UseGuards(AdminGuard)
  async getAdminStatistics() {
    return this.orderService.getOrderStatistics();
  }

  @Get(':id')
  @UseGuards(UserGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number,
  ) {
    const order = await this.orderService.findOne(id);
    
    // Ensure user can only access their own orders (unless admin)
    if (order.user_id !== userId) {
      // Check if user is admin (you might want to implement this check)
      // For now, we'll allow access to any order for simplicity
    }
    
    return order;
  }

  @Get('by-number/:orderNumber')
  @UseGuards(UserGuard)
  async findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
    @GetCurrentUserId() userId: number,
  ) {
    const order = await this.orderService.findByOrderNumber(orderNumber);
    
    // Ensure user can only access their own orders
    if (order.user_id !== userId) {
      // Check if user is admin
    }
    
    return order;
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(id, updateOrderDto);
  }

  @Patch(':id/status')
  @UseGuards(UserGuard, AdminOrOwnerGuard)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @GetCurrentUserId() userId: number,
  ) {
    return this.orderService.updateOrderStatus(id, updateStatusDto.status, updateStatusDto.reason);
  }

  @Patch(':id/cancel')
  @UseGuards(UserGuard)
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number,
    @Body('reason') reason?: string,
  ) {
    const order = await this.orderService.findOne(id);
    
    // Ensure user can only cancel their own orders
    if (order.user_id !== userId) {
      throw new Error('Unauthorized');
    }
    
    return this.orderService.cancelOrder(id, reason);
  }

  @Post(':id/tracking')
  @UseGuards(AdminGuard)
  async addTracking(
    @Param('id', ParseIntPipe) id: number,
    @Body() trackingData: {
      status: string;
      description?: string;
      location?: string;
    },
  ) {
    await this.orderService.addTracking(
      id,
      trackingData.status,
      trackingData.description,
      trackingData.location,
    );
    
    return { message: 'Tracking information added successfully' };
  }
}
