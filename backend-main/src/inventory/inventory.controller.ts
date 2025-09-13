
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('📦 Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('product/:id')
  @ApiOperation({ summary: 'Get inventory for product' })
  getByProductId(@Param('id') id: string) {
    return this.inventoryService.getInventoryByProductId(+id);
  }

  @Post('update-stock')
  @ApiOperation({ summary: 'Update product stock' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AdminGuard)
  updateStock(@Body() body: { productId: number, quantity: number, type: 'IN' | 'OUT', reason?: string }) {
    return this.inventoryService.updateStock(body.productId, body.quantity, body.type, body.reason);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock products' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AdminGuard)
  getLowStock() {
    return this.inventoryService.getLowStockProducts();
  }

  @Get('report')
  @ApiOperation({ summary: 'Get inventory report' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AdminGuard)
  getReport() {
    return this.inventoryService.getInventoryReport();
  }
}
