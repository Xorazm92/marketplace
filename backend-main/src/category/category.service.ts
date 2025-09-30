// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService implements OnModuleInit {
  private categories = [];

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Load categories from database on initialization
    await this.refreshCategories();
  }

  private async refreshCategories() {
    const dbCategories = await this.prisma.category.findMany({
      where: { is_active: true },
      orderBy: { id: 'asc' }
    });
    
    // Calculate levels for each category
    this.categories = dbCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id,
      level: this.calculateLevel(cat.parent_id, dbCategories),
      is_active: cat.is_active
    }));
  }

  private calculateLevel(parentId: number | null, categories: any[]): number {
    if (!parentId) return 0;
    const parent = categories.find(c => c.id === parentId);
    if (!parent) return 0;
    return 1 + this.calculateLevel(parent.parent_id, categories);
  }

  async create(createCategoryDto: CreateCategoryDto) {
    // Validate parent category exists if parent_id is provided
    if (createCategoryDto.parent_id) {
      const parentExists = await this.findOne(createCategoryDto.parent_id);
      if (!parentExists) {
        throw new NotFoundException(`Parent category with ID ${createCategoryDto.parent_id} not found`);
      }
    }

    // Generate slug if not provided
    const slug = createCategoryDto.slug || this.generateSlug(createCategoryDto.name);
    
    // Create category in database
    const newCategory = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug,
        parent_id: createCategoryDto.parent_id || null,
        is_active: createCategoryDto.is_active ?? true
      }
    });
    
    // Refresh cache
    await this.refreshCategories();
    
    return newCategory;
  }

  async findAll() {
    return this.categories.filter(cat => cat.is_active);
  }

  async findAllWithHierarchy() {
    const rootCategories = this.categories.filter(cat => cat.parent_id === null && cat.is_active);
    
    const buildHierarchy = (parentId: number | null) => {
      return this.categories
        .filter(cat => cat.parent_id === parentId && cat.is_active)
        .map(category => ({
          ...category,
          children: buildHierarchy(category.id),
          hasChildren: this.categories.some(cat => cat.parent_id === category.id && cat.is_active),
          childrenCount: this.categories.filter(cat => cat.parent_id === category.id && cat.is_active).length,
        }));
    };

    return buildHierarchy(null);
  }

  async findOne(id: number) {
    const category = this.categories.find(cat => cat.id === id && cat.is_active);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async findBySlug(slug: string) {
    const category = this.categories.find(cat => cat.slug === slug && cat.is_active);
    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }
    return category;
  }

  async findChildren(parentId: number) {
    const parent = await this.findOne(parentId);
    return this.categories.filter(cat => cat.parent_id === parentId && cat.is_active);
  }

  async findByLevel(level: number) {
    return this.categories.filter(cat => cat.level === level && cat.is_active);
  }

  async getRootCategories() {
    return this.categories.filter(cat => cat.parent_id === null && cat.is_active);
  }

  async getCategoryPath(categoryId: number): Promise<any[]> {
    const path = [];
    let currentCategory = await this.findOne(categoryId);
    
    while (currentCategory) {
      path.unshift(currentCategory);
      if (currentCategory.parent_id) {
        currentCategory = await this.findOne(currentCategory.parent_id);
      } else {
        break;
      }
    }
    
    return path;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Validate parent category if changing parent
    if (updateCategoryDto.parent_id && updateCategoryDto.parent_id !== existing.parent_id) {
      const parentExists = await this.findOne(updateCategoryDto.parent_id);
      if (!parentExists) {
        throw new NotFoundException(`Parent category with ID ${updateCategoryDto.parent_id} not found`);
      }

      // Prevent circular reference
      if (updateCategoryDto.parent_id === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
    }

    // Update in database
    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto
    });

    // Refresh cache
    await this.refreshCategories();

    return updatedCategory;
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category has children in database
    const childrenCount = await this.prisma.category.count({
      where: { parent_id: id, is_active: true }
    });
    
    if (childrenCount > 0) {
      throw new BadRequestException('Cannot delete category with active subcategories');
    }

    // Soft delete in database
    await this.prisma.category.update({
      where: { id },
      data: { is_active: false }
    });

    // Refresh cache
    await this.refreshCategories();

    return { message: 'Category deleted successfully' };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Validate category exists (for product creation)
  async validateCategoryExists(categoryId: number): Promise<boolean> {
    try {
      await this.findOne(categoryId);
      return true;
    } catch {
      return false;
    }
  }
}
