import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ModelService } from './model.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Model') 
@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Post()
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a new model' })
  @ApiResponse({ status: 201, description: 'Model created successfully' })
  create(@Body() createModelDto: CreateModelDto) {
    return this.modelService.create(createModelDto);
  }
  
  @Get()
  @ApiOperation({ summary: 'Get all models' })
  @ApiResponse({ status: 200, description: 'List of models' })
  findAll() {
    return this.modelService.findAll();
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get a model by ID' })
  @ApiResponse({ status: 200, description: 'Model found successfully' })
  @ApiResponse({ status: 404, description: 'Model not found' })
  findOne(@Param('id') id: string) {
    return this.modelService.findOne(+id);
  }
  
  @Put(':id')
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update a model by ID' })
  @ApiResponse({ status: 200, description: 'Model updated successfully' })
  update(@Param('id') id: string, @Body() updateModelDto: UpdateModelDto) {
    return this.modelService.update(+id, updateModelDto);
  }
  
  @Delete(':id')
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete a model by ID' })
  @ApiResponse({ status: 200, description: 'Model deleted successfully' })
  remove(@Param('id') id: string) {
    return this.modelService.remove(+id);
  }
}
