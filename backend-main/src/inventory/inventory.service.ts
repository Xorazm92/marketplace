
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventoryByProductId(productId: number) {
    return this.prisma.inventory.findUnique({
      where: { product_id: productId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      }
    });
  }

  async updateStock(productId: number, quantity: number, type: 'IN' | 'OUT', reason?: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { product_id: productId }
    });

    if (!inventory) {
      // Create new inventory record
      return this.prisma.inventory.create({
        data: {
          product_id: productId,
          stock_quantity: type === 'IN' ? quantity : 0,
          is_in_stock: quantity > 0
        }
      });
    }

    const newQuantity = type === 'IN' 
      ? inventory.stock_quantity + quantity 
      : inventory.stock_quantity - quantity;

    // Update inventory
    const updatedInventory = await this.prisma.inventory.update({
      where: { product_id: productId },
      data: {
        stock_quantity: Math.max(0, newQuantity),
        is_in_stock: newQuantity > inventory.low_stock_threshold
      }
    });

    // Record movement
    await this.prisma.inventoryMovement.create({
      data: {
        inventory_id: inventory.id,
        type: type === 'IN' ? 'IN' : 'OUT',
        quantity: quantity,
        reason: reason || `Stock ${type.toLowerCase()}`
      }
    });

    return updatedInventory;
  }

  async getLowStockProducts() {
    return this.prisma.inventory.findMany({
      where: {
        OR: [
          { stock_quantity: { lte: 10 } },
          { is_in_stock: false }
        ]
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            brand: true
          }
        }
      }
    });
  }

  async getInventoryReport() {
    const [totalProducts, inStock, outOfStock, lowStock] = await Promise.all([
      this.prisma.inventory.count(),
      this.prisma.inventory.count({ where: { is_in_stock: true } }),
      this.prisma.inventory.count({ where: { is_in_stock: false } }),
      this.prisma.inventory.count({ 
        where: { 
          stock_quantity: { lte: 10 },
          is_in_stock: true 
        } 
      })
    ]);

    return {
      totalProducts,
      inStock,
      outOfStock,
      lowStock,
      stockPercentage: totalProducts > 0 ? (inStock / totalProducts) * 100 : 0
    };
  }
}
