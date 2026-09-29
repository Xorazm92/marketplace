import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { defaultCurrencyId } from '../common/currency';
import { enabledPaymentMethods } from '../payments/methods';
import {
  AdminListOrdersQuery,
  CreateOrderDto,
  ListOrdersQuery,
  ONLINE_METHODS,
  PaymentMethod,
  UpdateOrderStatusDto,
} from './dto/create-order.dto';

type Tx = Prisma.TransactionClient;

const ORDER_INCLUDE = {
  items: {
    include: {
      product: {
        select: { id: true, title: true, slug: true, product_image: { where: { is_primary: true }, take: 1, select: { url: true } } },
      },
    },
  },
} satisfies Prisma.OrderInclude;

// Admin qo'lda qila oladigan o'tishlar. PAID holatiga faqat to'lov callback'i o'tkazadi.
const TRANSITIONS: Record<string, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const UNPAID_EXPIRY_MS = 24 * 3600_000;

@Injectable()
export class OrderService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrderService.name);
  private expiryTimer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    if (this.config.get('NODE_ENV') === 'test') return;
    this.expiryTimer = setInterval(() => this.expireUnpaidOrders().catch((e) => this.logger.error(e)), 10 * 60_000);
  }

  onModuleDestroy() {
    clearInterval(this.expiryTimer);
  }

  async createOrder(userId: number, dto: CreateOrderDto) {
    if (!enabledPaymentMethods(this.config).includes(dto.payment_method)) {
      throw new BadRequestException("Bu to'lov usuli hozir mavjud emas");
    }
    const address = await this.prisma.address.findFirst({
      where: { id: dto.address_id, user_id: userId },
      include: { region: { select: { name: true } }, district: { select: { name: true } }, user: { select: { phone_number: true } } },
    });
    // Birovning manzili bilan buyurtma berib bo'lmaydi (IDOR).
    if (!address) throw new BadRequestException('Manzil topilmadi');

    // Bir mahsulot ikki qatorda kelsa zaxira va min/max chegarasi yig'indiga qo'llanadi.
    const quantities = new Map<number, number>();
    for (const item of dto.items) {
      quantities.set(item.product_id, (quantities.get(item.product_id) ?? 0) + item.quantity);
    }

    const currency_id = await defaultCurrencyId(this.prisma);
    const order_number = `INB-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${randomBytes(3).toString('hex').toUpperCase()}`;

    const order = await this.prisma.$transaction(async (tx) => {
      let total_amount = 0;
      const lines: Array<{ product_id: number; quantity: number; unit_price: number; total_price: number }> = [];

      for (const [product_id, quantity] of quantities) {
        const product = await tx.product.findFirst({
          where: { id: product_id, is_active: true, is_deleted: false, is_checked: 'APPROVED' },
          include: { inventory: true },
        });
        if (!product) throw new BadRequestException(`Mahsulot #${product_id} sotuvda yo'q`);
        if (quantity < product.min_order_quantity || (product.max_order_quantity != null && quantity > product.max_order_quantity)) {
          throw new BadRequestException(`"${product.title}" uchun miqdor noto'g'ri`);
        }

        if (product.inventory) {
          // Shartli kamaytirish: tekshirish va yozish bitta SQL'da, shuning uchun
          // parallel ikki buyurtma oxirgi donani ikki marta sota olmaydi.
          const { count } = await tx.inventory.updateMany({
            where: { product_id, stock_quantity: { gte: quantity } },
            data: { stock_quantity: { decrement: quantity } },
          });
          if (count === 0) throw new BadRequestException(`"${product.title}" omborda yetarli emas`);
          await tx.inventoryMovement.create({
            data: { inventory_id: product.inventory.id, type: 'OUT', quantity, reason: 'order', reference_id: order_number },
          });
        } else if (product.availability_status === 'out_of_stock') {
          throw new BadRequestException(`"${product.title}" tugagan`);
        }

        // Narx faqat bazadan: mijoz yuborgan narxga ishonilsa, 1 so'mga sotib olish mumkin edi.
        const unit_price = Number(product.price);
        lines.push({ product_id, quantity, unit_price, total_price: unit_price * quantity });
        total_amount += unit_price * quantity;
      }

      const shipping_amount = this.shippingFee(total_amount);
      const created = await tx.order.create({
        data: {
          order_number,
          user_id: userId,
          total_amount,
          discount_amount: 0,
          tax_amount: 0,
          shipping_amount,
          final_amount: total_amount + shipping_amount,
          currency_id,
          payment_method: dto.payment_method,
          shipping_address_id: address.id,
          shipping_snapshot: {
            name: address.name,
            region: address.region?.name ?? null,
            district: address.district?.name ?? null,
            address: address.address,
            phone: address.phone_number ?? address.user.phone_number,
          },
          notes: dto.notes,
          items: { createMany: { data: lines } },
          tracking: { create: { status: 'PENDING', description: 'Buyurtma qabul qilindi' } },
        },
      });

      // Buyurtmaga o'tgan mahsulotlar savatdan chiqadi.
      await tx.cartItem.deleteMany({ where: { cart: { user_id: userId }, product_id: { in: [...quantities.keys()] } } });
      return created;
    });

    return this.findMine(userId, order.id);
  }

  async listMine(userId: number, query: ListOrdersQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = { user_id: userId };
    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({ where, include: ORDER_INCLUDE, orderBy: { id: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.order.count({ where }),
    ]);
    return { items: rows.map(toView), total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findMine(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, user_id: userId }, include: ORDER_INCLUDE });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    return toView(order);
  }

  async cancelMine(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, user_id: userId } });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    if (order.status !== 'PENDING' || order.payment_status === 'PAID') {
      throw new BadRequestException("Bu buyurtmani bekor qilib bo'lmaydi. Operator bilan bog'laning");
    }
    await this.prisma.$transaction((tx) => this.cancel(tx, orderId, 'Mijoz bekor qildi'));
    return this.findMine(userId, orderId);
  }

  async listAdmin(query: AdminListOrdersQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status as OrderStatus;
    if (query.payment_status) where.payment_status = query.payment_status as any;
    if (query.q) {
      where.OR = [
        { order_number: { contains: query.q, mode: 'insensitive' } },
        { user: { phone_number: { contains: query.q } } },
      ];
    }
    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { ...ORDER_INCLUDE, user: { select: { id: true, phone_number: true, first_name: true, last_name: true } } },
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items: rows.map((row) => ({ ...toView(row), user: row.user })), total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findAdmin(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        ...ORDER_INCLUDE,
        user: { select: { id: true, phone_number: true, first_name: true, last_name: true } },
        payments: { orderBy: { id: 'asc' }, select: { id: true, payment_method: true, amount: true, status: true, transaction_id: true, performed_at: true, cancelled_at: true, createdAt: true } },
        tracking: { orderBy: { id: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    return {
      ...toView(order),
      user: order.user,
      payments: order.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
      tracking: order.tracking,
    };
  }

  async updateStatusAdmin(orderId: number, dto: UpdateOrderStatusDto) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Buyurtma topilmadi');
      if (!TRANSITIONS[order.status]?.includes(dto.status)) {
        throw new BadRequestException(`${order.status} → ${dto.status} o'tishi mumkin emas`);
      }
      const online = ONLINE_METHODS.includes(order.payment_method as PaymentMethod);

      if (dto.status === 'CANCELLED') {
        // Pul qaytarish faqat provayder orqali: Payme/Click kabinetidan bekor qilinsa,
        // ularning callback'i buyurtmani o'zi bekor qiladi.
        if (online && order.payment_status === 'PAID') {
          throw new BadRequestException("To'langan buyurtmani avval to'lov tizimi orqali qaytaring");
        }
        await this.cancel(tx, orderId, dto.note || 'Admin bekor qildi');
        return;
      }
      if (online && order.payment_status !== 'PAID') {
        throw new BadRequestException("Onlayn to'lov hali tushmagan");
      }

      const data: Prisma.OrderUpdateInput = { status: dto.status };
      // Naqd to'lov yetkazib berishda olinadi: "yetkazildi" = pul olindi.
      if (dto.status === 'DELIVERED' && order.payment_method === 'CASH') {
        data.payment_status = 'PAID';
        data.paid_at = new Date();
        await tx.orderPayment.create({
          data: { order_id: orderId, amount: order.final_amount, payment_method: 'CASH', status: 'PAID', performed_at: new Date() },
        });
      }
      await tx.order.update({ where: { id: orderId }, data });
      await tx.orderTracking.create({ data: { order_id: orderId, status: dto.status, description: dto.note } });
    });
    return this.findAdmin(orderId);
  }

  // Zaxirani qaytaradi va buyurtmani bekor qiladi. To'lov provayderi ham shu
  // funksiyani chaqiradi, shuning uchun takroriy chaqiruv zaxirani ikki marta qaytarmaydi.
  async cancel(tx: Tx, orderId: number, reason: string): Promise<boolean> {
    const { count } = await tx.order.updateMany({
      where: { id: orderId, status: { not: 'CANCELLED' } },
      data: { status: 'CANCELLED', cancelled_at: new Date(), cancel_reason: reason },
    });
    if (count === 0) return false;

    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
    for (const item of order.items) {
      const inventory = await tx.inventory.findUnique({ where: { product_id: item.product_id } });
      if (!inventory) continue;
      await tx.inventory.update({ where: { id: inventory.id }, data: { stock_quantity: { increment: item.quantity } } });
      await tx.inventoryMovement.create({
        data: { inventory_id: inventory.id, type: 'IN', quantity: item.quantity, reason: 'order_cancelled', reference_id: order.order_number },
      });
    }
    await tx.orderTracking.create({ data: { order_id: orderId, status: 'CANCELLED', description: reason } });
    return true;
  }

  // Onlayn to'lovi kelmagan buyurtma zaxirani cheksiz band qilib turmasin.
  // Payme'da ochiq tranzaksiya (state 1) bo'lsa tegilmaydi — Payme o'zi 12 soatda bekor qiladi.
  async expireUnpaidOrders(now = new Date()): Promise<number> {
    const stale = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        payment_status: { not: 'PAID' },
        payment_method: { in: [...ONLINE_METHODS] },
        createdAt: { lt: new Date(now.getTime() - UNPAID_EXPIRY_MS) },
        payments: { none: { provider_state: { in: [0, 1] } } },
      },
      select: { id: true },
    });
    let expired = 0;
    for (const { id } of stale) {
      if (await this.prisma.$transaction((tx) => this.cancel(tx, id, "To'lov muddati o'tdi"))) expired++;
    }
    if (expired) this.logger.log(`To'lanmagan ${expired} ta buyurtma bekor qilindi`);
    return expired;
  }

  // Checkout sahifasi yakuniy summani to'lovdan oldin ko'rsatishi uchun.
  shippingRules() {
    return {
      flat_fee: Number(this.config.get('SHIPPING_FLAT_FEE') ?? 0),
      free_from: Number(this.config.get('FREE_SHIPPING_FROM') ?? 0),
    };
  }

  private shippingFee(itemsTotal: number): number {
    const fee = Number(this.config.get('SHIPPING_FLAT_FEE') ?? 0);
    const freeFrom = Number(this.config.get('FREE_SHIPPING_FROM') ?? 0);
    return freeFrom > 0 && itemsTotal >= freeFrom ? 0 : fee;
  }
}

function toView(order: Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>) {
  return {
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    payment_status: order.payment_status,
    payment_method: order.payment_method,
    total_amount: Number(order.total_amount),
    shipping_amount: Number(order.shipping_amount),
    discount_amount: Number(order.discount_amount),
    final_amount: Number(order.final_amount),
    shipping: order.shipping_snapshot,
    notes: order.notes,
    paid_at: order.paid_at,
    cancelled_at: order.cancelled_at,
    cancel_reason: order.cancel_reason,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      product_id: item.product_id,
      title: item.product.title,
      slug: item.product.slug,
      image: item.product.product_image[0]?.url ?? null,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      total_price: Number(item.total_price),
    })),
  };
}
