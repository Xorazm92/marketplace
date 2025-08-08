import { Test, TestingModule } from '@nestjs/testing';
import { ProductMediaService } from './product-media.service';
import { PrismaService } from '../prisma/prisma.service';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('ProductMediaService', () => {
  let service: ProductMediaService;
  const mockPrisma = {
    productImage: {
      create: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductMediaService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<ProductMediaService>(ProductMediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add image', async () => {
    await service.addImage(1, 'http://example.com/img.png');
    expect(mockPrisma.productImage.create).toHaveBeenCalledWith({
      data: { product_id: 1, url: 'http://example.com/img.png' },
    });
  });

  it('should delete image', async () => {
    await service.deleteImage(5);
    expect(mockPrisma.productImage.delete).toHaveBeenCalledWith({ where: { id: 5 } });
  });

  it('should get images', async () => {
    await service.getImages(2);
    expect(mockPrisma.productImage.findMany).toHaveBeenCalledWith({ where: { product_id: 2 } });
  });
});
