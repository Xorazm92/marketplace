import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get categories with hierarchy' })
  findAllWithHierarchy() {
    return this.categoryService.findAllWithHierarchy();
  }

  @Get('root')
  @ApiOperation({ summary: 'Get root categories only' })
  getRootCategories() {
    return this.categoryService.getRootCategories();
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get children of a category' })
  findChildren(@Param('id') id: string) {
    return this.categoryService.findChildren(+id);
  }

  @Get(':id/path')
  @ApiOperation({ summary: 'Get category path (breadcrumb)' })
  getCategoryPath(@Param('id') id: string) {
    return this.categoryService.getCategoryPath(+id);
  }

  @Get('level/:level')
  @ApiOperation({ summary: 'Get categories by level' })
  findByLevel(@Param('level') level: string) {
    return this.categoryService.findByLevel(+level);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
