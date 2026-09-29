import { Body, Controller, Get, Injectable, Module, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGuard } from '../guards/admin.guard';

class UsersQuery {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

class BlockDto {
  @IsBoolean()
  is_active: boolean;
}

@Injectable()
export class BackofficeService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [ordersByStatus, paidToday, paidTotal, users, products, lowStock] = await Promise.all([
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.order.aggregate({ where: { payment_status: 'PAID', paid_at: { gte: startOfDay } }, _sum: { final_amount: true }, _count: { _all: true } }),
      this.prisma.order.aggregate({ where: { payment_status: 'PAID' }, _sum: { final_amount: true }, _count: { _all: true } }),
      this.prisma.user.count(),
      this.prisma.product.count({ where: { is_deleted: false, is_active: true } }),
      this.prisma.inventory.findMany({
        where: { stock_quantity: { lte: 3 }, product: { is_deleted: false, is_active: true } },
        select: { stock_quantity: true, product: { select: { id: true, title: true } } },
        orderBy: { stock_quantity: 'asc' },
        take: 10,
      }),
    ]);
    return {
      orders_by_status: Object.fromEntries(ordersByStatus.map((row) => [row.status, row._count._all])),
      revenue_today: Number(paidToday._sum.final_amount ?? 0),
      paid_orders_today: paidToday._count._all,
      revenue_total: Number(paidTotal._sum.final_amount ?? 0),
      paid_orders_total: paidTotal._count._all,
      users,
      active_products: products,
      low_stock: lowStock.map((row) => ({ ...row.product, stock_quantity: row.stock_quantity })),
    };
  }

  async users(query: UsersQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = query.q
      ? { OR: [{ phone_number: { contains: query.q } }, { first_name: { contains: query.q, mode: 'insensitive' as const } }, { last_name: { contains: query.q, mode: 'insensitive' as const } }] }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: { id: true, phone_number: true, first_name: true, last_name: true, is_active: true, createdAt: true, _count: { select: { orders: true } } },
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  setUserActive(id: number, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      // Bloklangan foydalanuvchi refresh qila olmasin; access token 15 daqiqada eskiradi.
      data: { is_active: isActive, ...(isActive ? {} : { hashed_refresh_token: null }) },
      select: { id: true, phone_number: true, is_active: true },
    });
  }
}

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(AdminGuard)
export class BackofficeController {
  constructor(private readonly backoffice: BackofficeService) {}

  @Get('dashboard')
  dashboard() {
    return this.backoffice.dashboard();
  }

  @Get('users')
  users(@Query() query: UsersQuery) {
    return this.backoffice.users(query);
  }

  @Patch('users/:id/active')
  setUserActive(@Param('id', ParseIntPipe) id: number, @Body() dto: BlockDto) {
    return this.backoffice.setUserActive(id, dto.is_active);
  }
}

@Module({
  controllers: [BackofficeController],
  providers: [BackofficeService],
})
export class BackofficeModule {}
