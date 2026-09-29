import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserGuard } from '../guards/user.guard';
import { AdminGuard } from '../guards/admin.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';
import { OrderService } from './order.service';
import { AdminListOrdersQuery, CreateOrderDto, ListOrdersQuery, UpdateOrderStatusDto } from './dto/create-order.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(UserGuard)
export class OrderController {
  constructor(private readonly orders: OrderService) {}

  @Post()
  create(@GetCurrentUserId() userId: number, @Body() dto: CreateOrderDto) {
    return this.orders.createOrder(userId, dto);
  }

  @Get()
  list(@GetCurrentUserId() userId: number, @Query() query: ListOrdersQuery) {
    return this.orders.listMine(userId, query);
  }

  @Get(':id')
  findOne(@GetCurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.orders.findMine(userId, id);
  }

  @Post(':id/cancel')
  cancel(@GetCurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.orders.cancelMine(userId, id);
  }
}

@ApiTags('Orders')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly orders: OrderService) {}

  @Get()
  rules() {
    return this.orders.shippingRules();
  }
}

@ApiTags('Admin orders')
@ApiBearerAuth()
@Controller('admin/orders')
@UseGuards(AdminGuard)
export class AdminOrderController {
  constructor(private readonly orders: OrderService) {}

  @Get()
  list(@Query() query: AdminListOrdersQuery) {
    return this.orders.listAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orders.findAdmin(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatusAdmin(id, dto);
  }
}
