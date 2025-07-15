
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

export class TestUtils {
  static async createTestingModule(providers: any[]): Promise<TestingModule> {
    return Test.createTestingModule({
      providers: [
        ...providers,
        {
          provide: PrismaService,
          useValue: {
            // Mock Prisma methods
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            product: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            order: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            review: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                JWT_SECRET: 'test-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6379,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();
  }

  static mockUser(overrides = {}) {
    return {
      id: 1,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      role: 'user',
      age: 25,
      is_verified: true,
      ...overrides,
    };
  }

  static mockChildUser(overrides = {}) {
    return {
      id: 2,
      first_name: 'Child',
      last_name: 'User',
      email: 'child@example.com',
      role: 'child',
      age: 8,
      is_verified: true,
      parentalControls: {
        dailySpendLimit: 50,
        allowedCategories: ['toys', 'books'],
        timeRestrictions: {
          start: '08:00',
          end: '20:00',
        },
      },
      ...overrides,
    };
  }

  static mockProduct(overrides = {}) {
    return {
      id: 1,
      title: 'Test Product',
      description: 'Test Description',
      price: 29.99,
      category_id: 1,
      brand_id: 1,
      user_id: 1,
      is_active: true,
      is_checked: 'APPROVED',
      age_group: 'Early Elementary',
      is_educational: true,
      ...overrides,
    };
  }

  static mockOrder(overrides = {}) {
    return {
      id: 1,
      order_number: 'ORD-123456',
      user_id: 1,
      total_amount: 59.98,
      final_amount: 59.98,
      status: 'PENDING',
      payment_status: 'PENDING',
      currency_id: 1,
      ...overrides,
    };
  }

  static mockReview(overrides = {}) {
    return {
      id: 1,
      product_id: 1,
      user_id: 1,
      rating: 5,
      title: 'Great product!',
      comment: 'My child loves it',
      is_verified: true,
      ...overrides,
    };
  }
}

// Child safety test scenarios
export class ChildSafetyTestScenarios {
  static inappropriateContentTests = [
    {
      name: 'should block violent content',
      content: 'This toy gun shoots real bullets',
      expected: false,
    },
    {
      name: 'should block scary content',
      content: 'Horror doll that screams at night',
      expected: false,
    },
    {
      name: 'should allow educational content',
      content: 'Educational building blocks for learning math',
      expected: true,
    },
    {
      name: 'should allow age-appropriate toys',
      content: 'Soft teddy bear for toddlers',
      expected: true,
    },
  ];

  static parentalControlTests = [
    {
      name: 'should respect time restrictions',
      userAge: 8,
      currentTime: '22:00',
      timeRestrictions: { start: '08:00', end: '20:00' },
      expected: false,
    },
    {
      name: 'should allow access during allowed time',
      userAge: 8,
      currentTime: '15:00',
      timeRestrictions: { start: '08:00', end: '20:00' },
      expected: true,
    },
  ];
}

// Security test helpers
export class SecurityTestHelpers {
  static generateMaliciousInputs() {
    return [
      '<script>alert("xss")</script>',
      "'; DROP TABLE users; --",
      '{{7*7}}',
      '${7*7}',
      'javascript:alert(1)',
      '<iframe src="javascript:alert(1)"></iframe>',
    ];
  }

  static async testRateLimit(
    request: any,
    endpoint: string,
    maxRequests: number = 5
  ) {
    const promises = Array(maxRequests + 1)
      .fill(null)
      .map(() => request.get(endpoint));
    
    const responses = await Promise.all(promises);
    const lastResponse = responses[responses.length - 1];
    
    expect(lastResponse.status).toBe(429); // Too Many Requests
  }
}
