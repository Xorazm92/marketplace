import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const CATEGORY_PRODUCTS_LIMIT = 24;

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return await this.prisma.category.create({
      data: createCategoryDto
    });
  }

  // Bosh sahifa va katalog har ochilganda shu ro'yxatni so'raydi. Ilgari unga har bo'limning
  // mahsulotlari (rasmlari bilan) ilashardi: Prisma `take` ni xotirada qo'llagani uchun butun
  // katalog o'qilardi — 20 ming mahsulotda javob ~2 soniya. Mahsulotlar: GET /products?category=.
  async findAll() {
    return await this.prisma.category.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
    });
  }

  async findOne(id: number) {
    return this.withProducts({ id });
  }

  async findBySlug(slug: string) {
    return this.withProducts({ slug });
  }

  // Faqat xaridorga ko'rinadigan mahsulotlar va cheklangan sonda: to'liq ro'yxat
  // (sahifalash, filtr) — GET /products?category=<slug>.
  private async withProducts(where: { id: number } | { slug: string }) {
    const category = await this.prisma.category.findUnique({
      where,
      include: {
        products: {
          where: { is_active: true, is_deleted: false, is_checked: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: CATEGORY_PRODUCTS_LIMIT,
          include: { product_image: true, brand: true, currency: true },
        },
      },
    });
    if (!category) throw new NotFoundException("Bo'lim topilmadi");
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto
    });
  }

  async remove(id: number) {
    return await this.prisma.category.update({
      where: { id },
      data: { is_active: false }
    });
  }

  // Seed default categories
  async seedCategories() {
    const categories = [
      { name: 'Kiyim-kechak', slug: 'kiyim-kechak', description: 'Bolalar uchun kiyim-kechak' },
      { name: 'O\'yinchoqlar', slug: 'oyinchoqlar', description: 'Turli xil o\'yinchoqlar' },
      { name: 'Kitoblar', slug: 'kitoblar', description: 'Bolalar uchun kitoblar' },
      { name: 'Sport', slug: 'sport', description: 'Sport anjomlar' },
      { name: 'Maktab', slug: 'maktab', description: 'Maktab buyumlari' },
      { name: 'Chaqaloq', slug: 'chaqaloq', description: 'Chaqaloq buyumlari' },
      { name: 'Elektronika', slug: 'elektronika', description: 'Elektronika' },
      { name: 'Sog\'lik', slug: 'soglik', description: 'Sog\'liq mahsulotlari' }
    ];

    for (const category of categories) {
      await this.prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category
      });
    }

    return { message: 'Categories seeded successfully' };
  }
}
