import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductMediaService {
  constructor(private readonly prisma: PrismaService) {}

  async addImage(productId: number, url: string) {
    return this.prisma.productImage.create({
      data: {
        product_id: productId,
        url,
      },
    });
  }

  async deleteImage(imageId: number) {
    return this.prisma.productImage.delete({
      where: { id: imageId },
    });
  }

  async getImages(productId: number) {
    return this.prisma.productImage.findMany({
      where: { product_id: productId },
    });
  }
}
