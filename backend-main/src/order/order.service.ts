import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, CreateOrderInput } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderInput, OrderStatus, PaymentStatus } from './dto/update-order.dto';
import { OrderStatus as UpdateOrderStatus } from './dto/update-order-status.dto';
import { Order } from './types/order.types';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(createOrderDto: CreateOrderDto | CreateOrderInput): Promise<Order> {
    const { user_id, items, currency_id, shipping_address_id, billing_address_id, payment_method, notes, discount_amount = 0, tax_amount = 0, shipping_amount = 0 } = createOrderDto;

    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate products and calculate totals
    let total_amount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.product_id },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.product_id} not found`);
      }

      if (!product.is_active) {
        throw new BadRequestException(`Product ${product.title} is not active`);
      }

      const itemTotal = item.unit_price * item.quantity;
      total_amount += itemTotal;

      validatedItems.push({
        ...item,
        total_price: itemTotal,
      });
    }

    const final_amount = total_amount + tax_amount + shipping_amount - discount_amount;

    // Generate order number
    const order_number = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create order with items in transaction
    const order = await this.prisma.$transaction(async (prisma) => {
      // Create order
      const newOrder = await prisma.order.create({
        data: {
          order_number,
          user_id,
          total_amount,
          discount_amount,
          tax_amount,
          shipping_amount,
          final_amount,
          currency_id,
          status: OrderStatus.PENDING,
          payment_status: PaymentStatus.PENDING,
          payment_method,
          shipping_address_id,
          billing_address_id,
          notes,
        },
      });

      // Create order items
      await prisma.orderItem.createMany({
        data: validatedItems.map(item => ({
          order_id: newOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      });

      return newOrder;
    });

    return this.findOne(order.id);
  }

  async findAll(userId?: number, status?: OrderStatus, page = 1, limit = 10): Promise<{ orders: Order[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (userId) where.user_id = userId;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: true,
          currency: true,
          shipping_address: true,
          billing_address: true,
          items: {
            include: {
              product: true,
            },
          },
          payments: true,
          tracking: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    const ordersWithComputedFields = orders.map(order => ({
      ...order,
      total_amount: Number(order.total_amount),
      discount_amount: order.discount_amount !== undefined ? Number(order.discount_amount) : undefined,
      tax_amount: order.tax_amount !== undefined ? Number(order.tax_amount) : undefined,
      shipping_amount: order.shipping_amount !== undefined ? Number(order.shipping_amount) : undefined,
      final_amount: Number(order.final_amount),
      user: order.user ? {
        id: order.user.id,
        first_name: order.user.first_name ?? '',
        last_name: order.user.last_name ?? '',
        email: '',
      } : undefined,
      shipping_address: order.shipping_address ? {
        id: order.shipping_address.id,
        street: '', // fallback, not present in Prisma
        city: '',   // fallback
        country: '',// fallback
      } : undefined,
      billing_address: order.billing_address ? {
        id: order.billing_address.id,
        street: '', // fallback, not present in Prisma
        city: '',   // fallback
        country: '',// fallback
      } : undefined,
      items: order.items.map(item => ({
        ...item,
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
        product: item.product ? { ...item.product, price: Number(item.product.price) } : undefined,
      })),
      payments: order.payments?.map(payment => ({
        ...payment,
        amount: Number(payment.amount),
      })),
      total_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
      items_total: order.items.reduce((sum, item) => sum + Number(item.total_price), 0),
    }) as Order);

    return {
      orders: ordersWithComputedFields,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        currency: true,
        shipping_address: true,
        billing_address: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        tracking: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      ...order,
      total_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
      items_total: order.items.reduce((sum, item) => sum + Number(item.total_price), 0),
    } as unknown as Order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { order_number: orderNumber },
      include: {
        user: true,
        currency: true,
        shipping_address: true,
        billing_address: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        tracking: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      ...order,
      total_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
      items_total: order.items.reduce((sum, item) => sum + Number(item.total_price), 0),
    } as unknown as Order;
  }

  async updateOrder(id: number, updateOrderDto: UpdateOrderDto | UpdateOrderInput): Promise<Order> {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
    });

    return this.findOne(updatedOrder.id);
  }

  async cancelOrder(id: number, reason?: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel delivered order');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        notes: reason ? `${order.notes || ''}\nCancellation reason: ${reason}`.trim() : order.notes,
      },
    });

    return this.findOne(updatedOrder.id);
  }

  async addTracking(orderId: number, status: string, description?: string, location?: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.prisma.orderTracking.create({
      data: {
        order_id: orderId,
        status: typeof status === 'string' ? OrderStatus[status as keyof typeof OrderStatus] : status,
        description,
        location,
      },
    });

    // Update order status if needed
    if (status === 'SHIPPED') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.SHIPPED },
      });
    } else if (status === 'DELIVERED') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.DELIVERED },
      });
    }
  }

  async getOrderStatistics(userId?: number): Promise<any> {
    const where: any = {};
    if (userId) where.user_id = userId;

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.DELIVERED } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.CANCELLED } }),
      this.prisma.order.aggregate({
        where: { ...where, status: { not: OrderStatus.CANCELLED } },
        _sum: { final_amount: true },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: totalRevenue._sum.final_amount || 0,
    };
  }

  async updateOrderStatus(orderId: number, status: UpdateOrderStatus, reason?: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Status transition validation
    const validTransitions = {
      [UpdateOrderStatus.PENDING]: [UpdateOrderStatus.CONFIRMED, UpdateOrderStatus.CANCELLED],
      [UpdateOrderStatus.CONFIRMED]: [UpdateOrderStatus.PROCESSING, UpdateOrderStatus.CANCELLED],
      [UpdateOrderStatus.PROCESSING]: [UpdateOrderStatus.SHIPPED, UpdateOrderStatus.CANCELLED],
      [UpdateOrderStatus.SHIPPED]: [UpdateOrderStatus.DELIVERED],
      [UpdateOrderStatus.DELIVERED]: [],
      [UpdateOrderStatus.CANCELLED]: [],
    };

    const currentStatus = order.status as UpdateOrderStatus;
    if (!validTransitions[currentStatus]?.includes(status)) {
      throw new BadRequestException(`Cannot change status from ${currentStatus} to ${status}`);
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: status,
        updatedAt: new Date(),
        // Add status change log if needed
        ...(reason && { notes: order.notes ? `${order.notes}\n[${new Date().toISOString()}] Status changed to ${status}: ${reason}` : `[${new Date().toISOString()}] Status changed to ${status}: ${reason}` }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    return updatedOrder as unknown as Order;
  }
}
