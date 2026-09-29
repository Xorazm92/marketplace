import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderService } from './order.service';

// Tez (bazasiz) regressiya: narx faqat bazadan, zaxira shartli kamayadi.
// To'liq xatti-harakat haqiqiy Postgres bilan: test/mvp/orders.e2e-spec.ts.

function prismaMock() {
  const prisma: any = {
    address: {
      findFirst: jest.fn().mockResolvedValue({ id: 9, name: 'Uy', address: 'x', phone_number: null, region: { name: 'T' }, district: null, user: { phone_number: '+998900000000' } }),
    },
    currency: { upsert: jest.fn().mockResolvedValue({ id: 1 }) },
    product: { findFirst: jest.fn() },
    inventory: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    inventoryMovement: { create: jest.fn() },
    order: { create: jest.fn().mockResolvedValue({ id: 10 }) },
    cartItem: { deleteMany: jest.fn() },
  };
  prisma.$transaction = jest.fn((fn: (tx: any) => unknown) => fn(prisma));
  return prisma;
}

const config = (values: Record<string, string> = {}) => ({ get: (key: string) => values[key] }) as unknown as ConfigService;

const product = {
  id: 5,
  title: 'Konstruktor',
  price: '50000',
  min_order_quantity: 1,
  max_order_quantity: null,
  availability_status: 'in_stock',
  inventory: { id: 3 },
};

describe('OrderService.createOrder', () => {
  let prisma: any;
  let service: OrderService;
  const dto = (items: Array<{ product_id: number; quantity: number }>, payment_method: any = 'CASH') => ({ items, address_id: 9, payment_method });

  beforeEach(() => {
    prisma = prismaMock();
    prisma.product.findFirst.mockResolvedValue(product);
    service = new OrderService(prisma, config({ SHIPPING_FLAT_FEE: '15000' }));
    jest.spyOn(service, 'findMine').mockResolvedValue({ id: 10 } as any);
  });

  it('Product.price va server yetkazish narxini yozadi', async () => {
    await service.createOrder(1, dto([{ product_id: 5, quantity: 2 }]));
    const data = prisma.order.create.mock.calls[0][0].data;
    expect(data).toEqual(expect.objectContaining({ total_amount: 100000, shipping_amount: 15000, final_amount: 115000, user_id: 1 }));
    expect(data.items.createMany.data).toEqual([{ product_id: 5, quantity: 2, unit_price: 50000, total_price: 100000 }]);
  });

  it('manzil boshqa foydalanuvchiniki bo\'lsa rad etadi', async () => {
    prisma.address.findFirst.mockResolvedValue(null);
    await expect(service.createOrder(1, dto([{ product_id: 5, quantity: 1 }]))).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.address.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 9, user_id: 1 } }));
  });

  it('zaxira yetmasa buyurtma yaratilmaydi', async () => {
    prisma.inventory.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.createOrder(1, dto([{ product_id: 5, quantity: 3 }]))).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('bir mahsulotning ikki qatori bitta shartli kamaytirishga yig\'iladi', async () => {
    await service.createOrder(1, dto([{ product_id: 5, quantity: 1 }, { product_id: 5, quantity: 2 }]));
    expect(prisma.inventory.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.inventory.updateMany).toHaveBeenCalledWith({
      where: { product_id: 5, stock_quantity: { gte: 3 } },
      data: { stock_quantity: { decrement: 3 } },
    });
  });

  it('sozlanmagan to\'lov usulini rad etadi', async () => {
    await expect(service.createOrder(1, dto([{ product_id: 5, quantity: 1 }], 'PAYME'))).rejects.toBeInstanceOf(BadRequestException);
  });
});
