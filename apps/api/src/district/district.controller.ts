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
import { DistrictService } from './district.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('District') 
@Controller('district')
export class DistrictController {
  constructor(private readonly districtService: DistrictService) {}

  @Post()
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a new district' })
  @ApiResponse({ status: 201, description: 'District created successfully' })
  create(@Body() createDistrictDto: CreateDistrictDto) {
    return this.districtService.create(createDistrictDto);
  }
  
  @Get()
  @ApiOperation({ summary: 'Get all districts' })
  @ApiResponse({ status: 200, description: 'List of districts' })
  findAll() {
    return this.districtService.findAll();
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get a district by ID' })
  @ApiResponse({ status: 200, description: 'District retrieved successfully' })
  @ApiResponse({ status: 404, description: 'District not found' })
  findOne(@Param('id') id: string) {
    return this.districtService.findOne(+id);
  }
  
  @Put(':id')
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update a district by ID' })
  @ApiResponse({ status: 200, description: 'District updated successfully' })
  update(@Param('id') id: string, @Body() updateDistrictDto: UpdateDistrictDto) {
    return this.districtService.update(+id, updateDistrictDto);
  }
  
  @Delete(':id')
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete a district by ID' })
  @ApiResponse({ status: 200, description: 'District deleted successfully' })
  remove(@Param('id') id: string) {
    return this.districtService.remove(+id);
  }
}
