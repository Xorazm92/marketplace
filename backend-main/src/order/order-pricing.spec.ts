import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

// Faza 0 regressiyasi (C3): narx faqat bazadan, zaxira tranzaksiya ichida kamayadi.

function prismaMock() {
  const prisma: any = {
    user: { findUnique: jest.fn().mockResolvedValue({ id: 1 }) },
    product: { findUnique: jest.fn() },
    inventory: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    inventoryMovement: { create: jest.fn() },
    order: { create: jest.fn().mockResolvedValue({ id: 10 }), findUnique: jest.fn().mockResolvedValue({ id: 10 }) },
    orderItem: { createMany: jest.fn() },
  };
  prisma.$transaction = jest.fn((fn: (tx: any) => unknown) => fn(prisma));
  return prisma;
}

const product = {
  id: 5,
  title: 'Konstruktor',
  price: '50000',
  is_active: true,
  min_order_quantity: 1,
  max_order_quantity: null,
  availability_status: 'in_stock',
  inventory: { id: 3 },
};

const baseDto = { user_id: 1, currency_id: 1 };

describe('OrderService.createOrder', () => {
  let prisma: any;
  let service: OrderService;

  beforeEach(() => {
    prisma = prismaMock();
    prisma.product.findUnique.mockResolvedValue(product);
    service = new OrderService(prisma);
    jest.spyOn(service, 'findOne').mockResolvedValue({ id: 10 } as any);
  });

  it('mijoz yuborgan narxni e\'tiborsiz qoldirib, Product.price ni yozadi', async () => {
    await service.createOrder({
      ...baseDto,
      items: [{ product_id: 5, quantity: 2, unit_price: 1 } as any],
      discount_amount: 99999, shipping_amount: -500,
    } as any);

    expect(prisma.orderItem.createMany).toHaveBeenCalledWith({
      data: [{ order_id: 10, product_id: 5, quantity: 2, unit_price: 50000, total_price: 100000 }],
    });
    expect(prisma.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ total_amount: 100000, discount_amount: 0, shipping_amount: 0, final_amount: 100000 }),
    });
  });

  it('zaxira yetmasa buyurtma yaratilmaydi', async () => {
    prisma.inventory.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.createOrder({ ...baseDto, items: [{ product_id: 5, quantity: 3 }] } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('zaxirani shartli (stock >= miqdor) kamaytiradi va harakatni yozadi', async () => {
    await service.createOrder({ ...baseDto, items: [{ product_id: 5, quantity: 1 }, { product_id: 5, quantity: 2 }] } as any);
    // Bir mahsulotning ikki qatori bitta tekshiruvga yig'iladi.
    expect(prisma.inventory.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.inventory.updateMany).toHaveBeenCalledWith({
      where: { product_id: 5, stock_quantity: { gte: 3 } },
      data: { stock_quantity: { decrement: 3 } },
    });
    expect(prisma.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ inventory_id: 3, type: 'OUT', quantity: 3 }),
    });
  });

  it('zaxirasi kuzatilmaydigan, lekin tugagan mahsulotni sotmaydi', async () => {
    prisma.product.findUnique.mockResolvedValue({ ...product, inventory: null, availability_status: 'out_of_stock' });
    await expect(
      service.createOrder({ ...baseDto, items: [{ product_id: 5, quantity: 1 }] } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('max_order_quantity dan oshsa rad etadi', async () => {
    prisma.product.findUnique.mockResolvedValue({ ...product, max_order_quantity: 2 });
    await expect(
      service.createOrder({ ...baseDto, items: [{ product_id: 5, quantity: 3 }] } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.inventory.updateMany).not.toHaveBeenCalled();
  });
});

describe('CreateOrderDto validatsiyasi (main.ts dagi global pipe sozlamalari)', () => {
  const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
  const validate = (body: unknown) => pipe.transform(body, { type: 'body', metatype: CreateOrderDto });

  it('unit_price, discount_amount, shipping_amount qabul qilinmaydi', async () => {
    await expect(validate({ ...baseDto, items: [{ product_id: 5, quantity: 1, unit_price: 1 }] })).rejects.toBeDefined();
    await expect(validate({ ...baseDto, items: [{ product_id: 5, quantity: 1 }], shipping_amount: 0 })).rejects.toBeDefined();
  });

  it('nol, manfiy va kasr miqdorni rad etadi', async () => {
    for (const quantity of [0, -1, 1.5]) {
      await expect(validate({ ...baseDto, items: [{ product_id: 5, quantity }] })).rejects.toBeDefined();
    }
  });

  it('bo\'sh savat bilan buyurtma berib bo\'lmaydi', async () => {
    await expect(validate({ ...baseDto, items: [] })).rejects.toBeDefined();
  });

  it('to\'g\'ri so\'rovni o\'tkazadi', async () => {
    await expect(validate({ ...baseDto, items: [{ product_id: 5, quantity: 2 }] })).resolves.toBeDefined();
  });
});
