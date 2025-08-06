
import { Controller, Get, Post, Put, Delete, Param, Query, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Admin')
@ApiBearerAuth('inbola')
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users with pagination' })
  async getUserManagement(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.adminService.getUserManagement(+page, +limit);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get products with pagination and status filter' })
  async getProductManagement(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string
  ) {
    return this.adminService.getProductManagement(+page, +limit, status);
  }

  @Put('products/:id/approve')
  @ApiOperation({ summary: 'Approve product' })
  async approveProduct(@Param('id') id: string) {
    return this.adminService.approveProduct(+id);
  }

  @Put('products/:id/reject')
  @ApiOperation({ summary: 'Reject product' })
  async rejectProduct(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.adminService.rejectProduct(+id, body.reason);
  }
}
