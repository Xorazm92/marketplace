import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  private categories = [
    { id: 1, name: 'Kiyim-kechak', slug: 'kiyim-kechak', parent_id: null, level: 0, is_active: true },
    { id: 2, name: 'Ichki kiyim', slug: 'ichki-kiyim', parent_id: 1, level: 1, is_active: true },
    { id: 3, name: 'Tashqi kiyim', slug: 'tashqi-kiyim', parent_id: 1, level: 1, is_active: true },
    { id: 4, name: 'O\'yinchoqlar', slug: 'oyinchoqlar', parent_id: null, level: 0, is_active: true },
    { id: 5, name: 'Konstruktor', slug: 'konstruktor', parent_id: 4, level: 1, is_active: true },
    { id: 6, name: 'Yumshoq o\'yinchoqlar', slug: 'yumshoq-oyinchoqlar', parent_id: 4, level: 1, is_active: true },
    { id: 7, name: 'Kitoblar', slug: 'kitoblar', parent_id: null, level: 0, is_active: true },
    { id: 8, name: 'Ta\'lim kitoblari', slug: 'talim-kitoblari', parent_id: 7, level: 1, is_active: true },
    { id: 9, name: 'Ertaklar', slug: 'ertaklar', parent_id: 7, level: 1, is_active: true },
    { id: 10, name: 'Sport', slug: 'sport', parent_id: null, level: 0, is_active: true },
    { id: 11, name: 'Maktab', slug: 'maktab', parent_id: null, level: 0, is_active: true },
    { id: 12, name: 'Chaqaloq', slug: 'chaqaloq', parent_id: null, level: 0, is_active: true },
  ];

  async create(createCategoryDto: CreateCategoryDto) {
    // Validate parent category exists if parent_id is provided
    let level = 0; // Default level for root categories
    let parent_id: number | null = null;
    
    if (createCategoryDto.parent_id) {
      const parentExists = await this.findOne(createCategoryDto.parent_id);
      if (!parentExists) {
        throw new NotFoundException(`Parent category with ID ${createCategoryDto.parent_id} not found`);
      }
      level = parentExists.level + 1;
      parent_id = createCategoryDto.parent_id;
    }

    // Generate slug if not provided
    const slug = createCategoryDto.slug || this.generateSlug(createCategoryDto.name);
    
    // Create a new category with all required fields
    const newCategory = {
      id: this.categories.length > 0 ? Math.max(...this.categories.map(c => c.id)) + 1 : 1,
      name: createCategoryDto.name,
      slug,
      parent_id,
      level,
      is_active: createCategoryDto.is_active ?? true,
      sort_order: createCategoryDto.sort_order ?? 0,
      description: createCategoryDto.description,
      image_url: createCategoryDto.image_url
    };
    
    this.categories.push(newCategory);
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
    const categoryIndex = this.categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Validate parent category if changing parent
    if (updateCategoryDto.parent_id && updateCategoryDto.parent_id !== this.categories[categoryIndex].parent_id) {
      const parentExists = await this.findOne(updateCategoryDto.parent_id);
      if (!parentExists) {
        throw new NotFoundException(`Parent category with ID ${updateCategoryDto.parent_id} not found`);
      }

      // Prevent circular reference
      if (updateCategoryDto.parent_id === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
    }

    this.categories[categoryIndex] = {
      ...this.categories[categoryIndex],
      ...updateCategoryDto,
    };

    return this.categories[categoryIndex];
  }

  async remove(id: number) {
    const categoryIndex = this.categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category has children
    const hasChildren = this.categories.some(cat => cat.parent_id === id && cat.is_active);
    if (hasChildren) {
      throw new BadRequestException('Cannot delete category with active subcategories');
    }

    this.categories[categoryIndex].is_active = false;
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
