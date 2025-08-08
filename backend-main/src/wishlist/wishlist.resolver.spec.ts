import { Test, TestingModule } from '@nestjs/testing';
import { WishlistResolver } from './wishlist.resolver';
import { WishlistService } from './wishlist.service';
import { GraphqlAuthGuard } from '../chat/guards/graphql-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('WishlistResolver', () => {
  let resolver: WishlistResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WishlistResolver,
        {
          provide: GraphqlAuthGuard,
          useValue: { canActivate: () => true },
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: WishlistService,
          useValue: {
            getOrCreateWishlist: jest.fn().mockResolvedValue({ items: [], total_items: 0 }),
            addToWishlist: jest.fn().mockResolvedValue({}),
            removeFromWishlist: jest.fn().mockResolvedValue({}),
            clearWishlist: jest.fn().mockResolvedValue({}),
            isInWishlist: jest.fn().mockResolvedValue(false),
          },
        },
      ],
    }).compile();

    resolver = module.get<WishlistResolver>(WishlistResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
