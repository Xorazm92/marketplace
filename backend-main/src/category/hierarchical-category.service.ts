// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHierarchicalCategoryDto, UpdateHierarchicalCategoryDto, CategoryQueryDto, BulkReorderDto, CategoryResponseDto } from './dto/category.dto';

@Injectable()
export class HierarchicalCategoryService {
  constructor(private prisma: PrismaService) {}

  private async generateSlug(name: string, excludeId?: string): Promise<string> {
    const baseSlug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    let slug = baseSlug;
    let counter = 1;

    while (await this.slugExists(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }

  private async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await // @ts-ignore
    this.prisma.category.findFirst({
      where: { slug, ...(excludeId && { id: { not: excludeId } }) }
    });
    return !!existing;
  }

  async getCategoryTree(query: CategoryQueryDto) {
    const { parentId, search, page = 1, limit = 20, active } = query;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (parentId !== undefined) where.parent_id = parentId === 'null' ? null : parentId;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (active !== undefined) where.is_active = active;

    const [categories, total] = await Promise.all([
    this.prisma.category.findMany({
        where,
        include: { _count: { select: { children: true, products: true } } },
        orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
        skip: offset,
        take: limit
      }),
    this.prisma.category.count({ where })
    ]);

    const data = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id,
      icon: cat.icon,
      color: cat.color,
      description: cat.description,
      meta_title: cat.meta_title,
      meta_description: cat.meta_description,
      sort_order: cat.sort_order,
      is_active: cat.is_active,
      created_at: cat.created_at,
      updated_at: cat.updated_at,
      children_count: cat._count.children,
      product_count: cat._count.products
    }));

    return { data, total, page, limit };
  }

  async createCategory(dto: CreateHierarchicalCategoryDto): Promise<CategoryResponseDto> {
    const slug = await this.generateSlug(dto.name);
    
    const category = await // @ts-ignore
    this.prisma.category.create({
      data: { ...dto, slug },
      include: { _count: { select: { children: true, products: true } } }
    });

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id,
      icon: category.icon,
      color: category.color,
      description: category.description,
      meta_title: category.meta_title,
      meta_description: category.meta_description,
      sort_order: category.sort_order,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
      children_count: category._count.children,
      product_count: category._count.products
    };
  }

  async updateCategory(id: string, dto: UpdateHierarchicalCategoryDto): Promise<CategoryResponseDto> {
    const existing = await // @ts-ignore
    this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Category with ID ${id} not found`);

    const updateData: any = { ...dto };
    if (dto.name && dto.name !== existing.name) {
      updateData.slug = await this.generateSlug(dto.name, id);
    }

    const category = await // @ts-ignore
    this.prisma.category.update({
      where: { id },
      data: updateData,
      include: { _count: { select: { children: true, products: true } } }
    });

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id,
      icon: category.icon,
      color: category.color,
      description: category.description,
      meta_title: category.meta_title,
      meta_description: category.meta_description,
      sort_order: category.sort_order,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
      children_count: category._count.children,
      product_count: category._count.products
    };
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await // @ts-ignore
    this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { children: true, products: true } } }
    });

    if (!category) throw new NotFoundException(`Category with ID ${id} not found`);
    
    if (category._count.children > 0) {
      throw new BadRequestException('Cannot delete category with children');
    }
    
    if (category._count.products > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    await // @ts-ignore
    this.prisma.category.delete({ where: { id } });
  }

  async bulkReorder(dto: BulkReorderDto): Promise<void> {
    await // @ts-ignore
    this.prisma.$transaction(async (tx) => {
      for (const order of dto.orders) {
        await tx.category.update({
          where: { id: order.id },
          data: {
            parent_id: order.parent_id,
            sort_order: order.sort_order
          }
        });
      }
    });
  }
}
