import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AdminGuard } from '../guards/admin.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiBearerAuth("inbola")
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a new category' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  // Ochiq o'qish (SSR bitta IP'dan so'raydi) — IP chegarasidan tashqarida; qarang: catalog.controllers.ts.
  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: 'Get all categories' })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Post('seed')
  @ApiBearerAuth("inbola")
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Seed default categories' })
  seedCategories() {
    // Demo kategoriyalar prod katalogiga aralashmasligi uchun.
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }
    return this.categoryService.seedCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth("inbola")
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update category' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiBearerAuth("inbola")
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete category' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
