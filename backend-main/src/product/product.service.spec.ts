import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductMediaService } from './product-media.service';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('ProductService', () => {
  let service: ProductService;
  const mockPrisma = {
    product: {
      create: jest.fn().mockResolvedValue({ id: 1, title: 'Test Product' }),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
    productImage: {
      create: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ProductMediaService, useValue: {
          addImage: jest.fn().mockResolvedValue({}),
          deleteImage: jest.fn().mockResolvedValue({}),
          getImages: jest.fn().mockResolvedValue([]),
        } },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const result = await service.create({
      title: 'Test',
      price: 100,
      currency_id: 1,
      category_id: 1,
      brand_id: 1,
      description: 'desc',
      negotiable: false,
      condition: true,
      phone_number: '123',
      address_id: null,
      images: [],
    } as any);
    expect(result).toHaveProperty('id');
    expect(mockPrisma.product.create).toHaveBeenCalled();
  });
});
