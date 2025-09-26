import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { HierarchicalCategoryService } from './hierarchical-category.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto, BulkReorderDto, CategoryResponseDto, CategoryTreeResponseDto } from './dto/category.dto';

@ApiTags('Hierarchical Categories')
@Controller('hierarchical-categories')
export class HierarchicalCategoryController {
  constructor(private readonly categoryService: HierarchicalCategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get categories with pagination and filtering' })
  @ApiQuery({ name: 'parentId', required: false, description: 'Parent category ID (use "null" for root categories)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for category name' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully', type: CategoryTreeResponseDto })
  async getCategories(@Query() query: CategoryQueryDto): Promise<CategoryTreeResponseDto> {
    const result = await this.categoryService.getCategoryTree(query);
    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit
    };
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get full category tree (hierarchical structure)' })
  @ApiResponse({ status: 200, description: 'Category tree retrieved successfully' })
  async getCategoryTree(): Promise<{ success: boolean; data: CategoryResponseDto[] }> {
    const data = await this.categoryService.getCategoryTree({ page: 1, limit: 1000 });
    return {
      success: true,
      data: data.data
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryById(@Param('id') id: string): Promise<{ success: boolean; data: CategoryResponseDto }> {
    const category = await this.categoryService.getCategoryTree({ 
      parentId: undefined, 
      page: 1, 
      limit: 1000 
    });
    
    const found = category.data.find(cat => cat.id === id);
    if (!found) {
      throw new Error('Category not found');
    }
    
    return {
      success: true,
      data: found
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<{ success: boolean; data: CategoryResponseDto }> {
    const category = await this.categoryService.createCategory(createCategoryDto);
    return {
      success: true,
      data: category
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<{ success: boolean; data: CategoryResponseDto }> {
    const category = await this.categoryService.updateCategory(id, updateCategoryDto);
    return {
      success: true,
      data: category
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete category with children or products' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string): Promise<void> {
    await this.categoryService.deleteCategory(id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Bulk reorder categories (drag & drop)' })
  @ApiResponse({ status: 200, description: 'Categories reordered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid reorder data' })
  async reorderCategories(@Body() bulkReorderDto: BulkReorderDto): Promise<{ success: boolean; message: string }> {
    await this.categoryService.bulkReorder(bulkReorderDto);
    return {
      success: true,
      message: 'Categories reordered successfully'
    };
  }

  @Get('slug/:slugChain')
  @ApiOperation({ summary: 'Resolve category by slug chain (SEO URLs)' })
  @ApiParam({ name: 'slugChain', description: 'Slug chain separated by slashes', example: 'oyinchoqlar/konstruktorlar' })
  @ApiResponse({ status: 200, description: 'Category resolved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async resolveCategoryBySlugChain(@Param('slugChain') slugChain: string): Promise<{ success: boolean; data: CategoryResponseDto }> {
    // Split slug chain and find deepest matching category
    const slugs = slugChain.split('/');
    
    // For now, just find by the last slug (can be enhanced for full path resolution)
    const lastSlug = slugs[slugs.length - 1];
    
    const categories = await this.categoryService.getCategoryTree({ page: 1, limit: 1000 });
    const found = categories.data.find(cat => cat.slug === lastSlug);
    
    if (!found) {
      throw new Error('Category not found');
    }
    
    return {
      success: true,
      data: found
    };
  }
}
