import { Test, TestingModule } from '@nestjs/testing';
import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';
import { GraphqlAuthGuard } from '../chat/guards/graphql-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('CartResolver', () => {
  let resolver: CartResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartResolver,
        {
          provide: CartService,
          useValue: {
            getOrCreateCart: jest.fn().mockResolvedValue({ items: [], total_items: 0, total_amount: 0 }),
            addToCart: jest.fn().mockResolvedValue({}),
            updateCartItem: jest.fn().mockResolvedValue({}),
            removeFromCart: jest.fn().mockResolvedValue({}),
            clearCart: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: GraphqlAuthGuard,
          useClass: class MockGuard {
            canActivate() { return true; }
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<CartResolver>(CartResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
