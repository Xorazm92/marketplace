import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './types/order.types';
import { CreateOrderInput } from './dto/create-order.dto';
import { UpdateOrderInput, OrderStatus } from './dto/update-order.dto';
import { UserGuard } from '../guards/user.guard';
import { AdminGuard } from '../guards/admin.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Mutation(() => Order)
  @UseGuards(UserGuard)
  async createOrder(
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
    @GetCurrentUserId() userId: number,
  ): Promise<Order> {
    // Ensure the order is created for the authenticated user
    createOrderInput.user_id = userId;
    return this.orderService.createOrder(createOrderInput);
  }

  @Query(() => [Order])
  @UseGuards(UserGuard)
  async myOrders(
    @GetCurrentUserId() userId: number,
    @Args('status', { type: () => String, nullable: true }) status?: OrderStatus,
    @Args('page', { type: () => Int, defaultValue: 1 }) page = 1,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit = 10,
  ): Promise<Order[]> {
    const result = await this.orderService.findAll(userId, status, page, limit);
    return result.orders;
  }

  @Query(() => [Order])
  @UseGuards(AdminGuard)
  async allOrders(
    @Args('userId', { type: () => Int, nullable: true }) userId?: number,
    @Args('status', { type: () => String, nullable: true }) status?: OrderStatus,
    @Args('page', { type: () => Int, defaultValue: 1 }) page = 1,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit = 20,
  ): Promise<Order[]> {
    const result = await this.orderService.findAll(userId, status, page, limit);
    return result.orders;
  }

  @Query(() => Order)
  @UseGuards(UserGuard)
  async order(
    @Args('id', { type: () => Int }) id: number,
    @GetCurrentUserId() userId: number,
  ): Promise<Order> {
    const order = await this.orderService.findOne(id);
    
    // Ensure user can only access their own orders (unless admin)
    if (order.user_id !== userId) {
      // You might want to check if user is admin here
      throw new Error('Unauthorized');
    }
    
    return order;
  }

  @Query(() => Order)
  @UseGuards(UserGuard)
  async orderByNumber(
    @Args('orderNumber') orderNumber: string,
    @GetCurrentUserId() userId: number,
  ): Promise<Order> {
    const order = await this.orderService.findByOrderNumber(orderNumber);
    
    // Ensure user can only access their own orders
    if (order.user_id !== userId) {
      // You might want to check if user is admin here
      throw new Error('Unauthorized');
    }
    
    return order;
  }

  @Mutation(() => Order)
  @UseGuards(AdminGuard)
  async updateOrder(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateOrderInput') updateOrderInput: UpdateOrderInput,
  ): Promise<Order> {
    return this.orderService.updateOrder(id, updateOrderInput);
  }

  @Mutation(() => Order)
  @UseGuards(UserGuard)
  async cancelOrder(
    @Args('id', { type: () => Int }) id: number,
    @Args('reason', { nullable: true }) reason?: string,
    @GetCurrentUserId() userId?: number,
  ): Promise<Order> {
    const order = await this.orderService.findOne(id);
    
    // Ensure user can only cancel their own orders
    if (order.user_id !== userId) {
      throw new Error('Unauthorized');
    }
    
    return this.orderService.cancelOrder(id, reason);
  }

  @Mutation(() => Boolean)
  @UseGuards(AdminGuard)
  async addOrderTracking(
    @Args('orderId', { type: () => Int }) orderId: number,
    @Args('status') status: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('location', { nullable: true }) location?: string,
  ): Promise<boolean> {
    await this.orderService.addTracking(orderId, status, description, location);
    return true;
  }

  @Query(() => String)
  @UseGuards(UserGuard)
  async myOrderStatistics(
    @GetCurrentUserId() userId: number,
  ): Promise<any> {
    return this.orderService.getOrderStatistics(userId);
  }

  @Query(() => String)
  @UseGuards(AdminGuard)
  async orderStatistics(): Promise<any> {
    return this.orderService.getOrderStatistics();
  }
}
