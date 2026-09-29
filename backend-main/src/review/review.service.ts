import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

// Sharhda muallifning faqat ismi chiqadi: telefon va familiya ochiq sahifaga tushmaydi.
const REVIEW_SELECT = {
  id: true,
  product_id: true,
  rating: true,
  title: true,
  comment: true,
  is_verified: true,
  createdAt: true,
  user: { select: { first_name: true } },
} satisfies Prisma.ReviewSelect;

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async listForProduct(productId: number, page = 1, limit = 10) {
    const where = { product_id: productId };
    const [items, total] = await Promise.all([
      this.prisma.review.findMany({ where, select: REVIEW_SELECT, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.review.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async stats(productId: number) {
    const [aggregate, groups] = await Promise.all([
      this.prisma.review.aggregate({ where: { product_id: productId }, _avg: { rating: true }, _count: { _all: true } }),
      this.prisma.review.groupBy({ by: ['rating'], where: { product_id: productId }, _count: { _all: true } }),
    ]);
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const group of groups) distribution[group.rating] = group._count._all;
    return {
      average: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : null,
      count: aggregate._count._all,
      distribution,
    };
  }

  // Sharhni faqat mahsulotni olgan xaridor qoldiradi: aks holda raqobatchi yoki bot
  // reytingni istagancha tushira oladi.
  async create(userId: number, dto: CreateReviewDto) {
    const purchased = await this.prisma.orderItem.findFirst({
      where: { product_id: dto.product_id, order: { user_id: userId, status: 'DELIVERED' } },
      select: { id: true },
    });
    if (!purchased) {
      throw new BadRequestException("Sharhni mahsulot sizga yetkazilgandan keyin qoldirish mumkin");
    }
    try {
      return await this.prisma.review.create({
        data: { ...dto, user_id: userId, is_verified: true },
        select: REVIEW_SELECT,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Bu mahsulotga sharh qoldirgansiz — uni tahrirlashingiz mumkin');
      }
      throw error;
    }
  }

  async update(userId: number, id: number, dto: UpdateReviewDto) {
    await this.own(userId, id);
    return this.prisma.review.update({ where: { id }, data: dto, select: REVIEW_SELECT });
  }

  async remove(userId: number, id: number) {
    await this.own(userId, id);
    await this.prisma.review.delete({ where: { id } });
    return { success: true };
  }

  mine(userId: number) {
    return this.prisma.review.findMany({
      where: { user_id: userId },
      select: { ...REVIEW_SELECT, product: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async own(userId: number, id: number) {
    const review = await this.prisma.review.findFirst({ where: { id, user_id: userId }, select: { id: true } });
    if (!review) throw new NotFoundException('Sharh topilmadi');
  }
}
