
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ColorsService } from '../colors/colors.service';
import { CreateColorDto } from '../colors/dto/create-color.dto';
import { UpdateColorDto } from '../colors/dto/update-color.dto';

@ApiTags('🎨 Colors')
@Controller('color')
export class ColorController {
  constructor(private readonly colorsService: ColorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new color' })
  create(@Body() createColorDto: CreateColorDto) {
    return this.colorsService.create(createColorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all colors' })
  findAll() {
    return this.colorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get color by ID' })
  findOne(@Param('id') id: string) {
    return this.colorsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update color' })
  update(@Param('id') id: string, @Body() updateColorDto: UpdateColorDto) {
    return this.colorsService.update(+id, updateColorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete color' })
  remove(@Param('id') id: string) {
    return this.colorsService.remove(+id);
  }
}
