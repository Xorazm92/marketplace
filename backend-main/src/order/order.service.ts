import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, CreateOrderInput } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderInput, OrderStatus, PaymentStatus } from './dto/update-order.dto';
import { Order } from './types/order.types';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(createOrderDto: CreateOrderDto | CreateOrderInput): Promise<Order> {
    const { user_id, items, currency_id, shipping_address_id, billing_address_id, payment_method, notes } = createOrderDto;

    const user = await this.prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Bir mahsulot ikki qatorda kelsa zaxira va min/max chegarasi yig'indiga qo'llanadi.
    const quantities = new Map<number, number>();
    for (const item of items) {
      quantities.set(item.product_id, (quantities.get(item.product_id) ?? 0) + item.quantity);
    }

    const order_number = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const order = await this.prisma.$transaction(async (prisma) => {
      let total_amount = 0;
      const lines = [];

      for (const [product_id, quantity] of quantities) {
        const product = await prisma.product.findUnique({
          where: { id: product_id },
          include: { inventory: true },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${product_id} not found`);
        }
        if (!product.is_active) {
          throw new BadRequestException(`Product ${product.title} is not active`);
        }
        if (quantity < product.min_order_quantity ||
            (product.max_order_quantity != null && quantity > product.max_order_quantity)) {
          throw new BadRequestException(`Invalid quantity for product ${product.title}`);
        }

        if (product.inventory) {
          // Shartli kamaytirish: tekshirish va yozish bitta SQL'da, shuning uchun
          // parallel ikki buyurtma oxirgi donani ikki marta sota olmaydi.
          const { count } = await prisma.inventory.updateMany({
            where: { product_id, stock_quantity: { gte: quantity } },
            data: { stock_quantity: { decrement: quantity } },
          });
          if (count === 0) {
            throw new BadRequestException(`Not enough stock for product ${product.title}`);
          }
          await prisma.inventoryMovement.create({
            data: {
              inventory_id: product.inventory.id,
              type: 'OUT',
              quantity,
              reason: 'order',
              reference_id: order_number,
            },
          });
        } else if (product.availability_status === 'out_of_stock') {
          throw new BadRequestException(`Product ${product.title} is out of stock`);
        }

        // Narx faqat bazadan: mijoz yuborgan narxga ishonilsa, 1 so'mga sotib olish mumkin edi.
        const unit_price = Number(product.price);
        const total_price = unit_price * quantity;
        total_amount += total_price;
        lines.push({ product_id, quantity, unit_price, total_price });
      }

      // Kupon, soliq va yetkazish qoidalari hali yo'q (docs/plan/MVP_ROADMAP.md, Faza 1);
      // ular qo'shilguncha nolga teng, mijozdan esa hech qachon olinmaydi.
      const discount_amount = 0;
      const tax_amount = 0;
      const shipping_amount = 0;
      const final_amount = total_amount + tax_amount + shipping_amount - discount_amount;

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

      await prisma.orderItem.createMany({
        data: lines.map(line => ({ order_id: newOrder.id, ...line })),
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
}
