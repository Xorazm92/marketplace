import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return await this.prisma.category.create({
      data: createCategoryDto
    });
  }

  async findAll() {
    return await this.prisma.category.findMany({
      where: { is_active: true },
      include: {
        products: {
          where: { is_active: true, is_deleted: false },
          take: 5,
          include: {
            product_image: true
          }
        }
      }
    });
  }

  async findOne(id: number) {
    return await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { is_active: true, is_deleted: false },
          include: {
            product_image: true,
            brand: true,
            currency: true
          }
        }
      }
    });
  }

  async findBySlug(slug: string) {
    return await this.prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { is_active: true, is_deleted: false },
          include: {
            product_image: true,
            brand: true,
            currency: true
          }
        }
      }
    });
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
