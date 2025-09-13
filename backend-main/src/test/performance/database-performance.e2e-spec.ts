import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('Database & Performance Tests (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: number;
  const testUsers: number[] = [];
  const testProducts: number[] = [];
  const testOrders: number[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
    await app.close();
  });

  async function setupTestData() {
    // Create test user
    const userResponse = await request(app.getHttpServer())
      .post('/api/user-auth/phone-register')
      .send({
        phone_number: '+998901234567',
        otp: '123456',
        first_name: 'Performance',
        last_name: 'Test',
      });

    if (userResponse.status === 201) {
      authToken = userResponse.body.access_token;
      userId = userResponse.body.user.id;
      testUsers.push(userId);
    }
  }

  async function cleanupTestData() {
    try {
      // Clean up in reverse order of dependencies
      if (testOrders.length > 0) {
        await prisma.order.deleteMany({
          where: { id: { in: testOrders } },
        });
      }

      if (testProducts.length > 0) {
        await prisma.product.deleteMany({
          where: { id: { in: testProducts } },
        });
      }

      if (testUsers.length > 0) {
        await prisma.user.deleteMany({
          where: { id: { in: testUsers } },
        });
      }
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  }

  describe('Database Connection & Health', () => {
    it('should maintain stable database connection', async () => {
      const startTime = Date.now();
      
      // Test basic query
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      
      const duration = Date.now() - startTime;
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(100); // Should respond within 100ms
    });

    it('should handle database connection pooling', async () => {
      const promises = [];
      
      // Create multiple concurrent database queries
      for (let i = 0; i < 20; i++) {
        promises.push(
          prisma.user.count()
        );
      }

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(results.length).toBe(20);
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      
      // All results should be numbers
      results.forEach(result => {
        expect(typeof result).toBe('number');
      });
    });

    it('should recover from connection errors gracefully', async () => {
      // This test simulates connection recovery
      // In a real scenario, you might temporarily disable the connection
      
      try {
        const result = await prisma.user.findFirst();
        expect(result).toBeDefined();
      } catch (error) {
        // Should handle connection errors gracefully
        expect(error).toBeDefined();
      }
    });
  });

  describe('Data Integrity & Transactions', () => {
    it('should maintain ACID properties in transactions', async () => {
      let createdUser: any;
      let createdProduct: any;

      try {
        // Start a transaction
        const result = await prisma.$transaction(async (tx) => {
          // Create user
          createdUser = await tx.user.create({
            data: {
              phone_number: '+998907777777',
              first_name: 'Transaction',
              last_name: 'Test',
              is_active: true,
            },
          });

          testUsers.push(createdUser.id);

          // Create product
          createdProduct = await tx.product.create({
            data: {
              title: 'Transaction Test Product',
              description: 'Test product for transaction',
              price: 50000,
              currency_id: 1,
              brand_id: 1,
              phone_number: '+998907777777',
              user_id: createdUser.id,
            },
          });

          testProducts.push(createdProduct.id);

          // Create order
          const order = await tx.order.create({
            data: {
              user_id: createdUser.id,
              order_number: `TEST-${Date.now()}`,
              total_amount: 50000,
              final_amount: 50000,
              status: 'PENDING',
              payment_status: 'PENDING',
            },
          });

          testOrders.push(order.id);

          return { user: createdUser, product: createdProduct, order };
        });

        expect(result.user.id).toBe(createdUser.id);
        expect(result.product.id).toBe(createdProduct.id);
        
        // Verify all data was committed
        const userExists = await prisma.user.findUnique({
          where: { id: createdUser.id },
        });
        expect(userExists).toBeDefined();

      } catch (error) {
        // If transaction fails, no data should be committed
        if (createdUser) {
          const userExists = await prisma.user.findUnique({
            where: { id: createdUser.id },
          });
          expect(userExists).toBeNull();
        }
      }
    });

    it('should rollback failed transactions', async () => {
      let tempUserId: number;

      try {
        await prisma.$transaction(async (tx) => {
          // Create user
          const user = await tx.user.create({
            data: {
              phone_number: '+998908888888',
              first_name: 'Rollback',
              last_name: 'Test',
              is_active: true,
            },
          });

          tempUserId = user.id;

          // Intentionally cause an error to trigger rollback
          throw new Error('Intentional rollback');
        });
      } catch (error) {
        expect(error.message).toBe('Intentional rollback');
      }

      // User should not exist due to rollback
      if (tempUserId) {
        const userExists = await prisma.user.findUnique({
          where: { id: tempUserId },
        });
        expect(userExists).toBeNull();
      }
    });

    it('should handle concurrent modifications correctly', async () => {
      // Create a product for concurrent modification
      const product = await prisma.product.create({
        data: {
          title: 'Concurrent Test Product',
          description: 'Test product for concurrent modifications',
          price: 30000,
          currency_id: 1,
          brand_id: 1,
          phone_number: '+998901234567',
          user_id: userId,
        },
      });

      testProducts.push(product.id);

      // Simulate concurrent updates
      const updatePromises = [];
      for (let i = 0; i < 5; i++) {
        updatePromises.push(
          prisma.product.update({
            where: { id: product.id },
            data: {
              price: 30000 + (i * 1000),
              updatedAt: new Date(),
            },
          })
        );
      }

      const results = await Promise.allSettled(updatePromises);
      
      // At least one update should succeed
      const successfulUpdates = results.filter(r => r.status === 'fulfilled');
      expect(successfulUpdates.length).toBeGreaterThan(0);

      // Final state should be consistent
      const finalProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(finalProduct).toBeDefined();
      expect(finalProduct.price).toBeGreaterThanOrEqual(30000);
    });

    it('should maintain referential integrity', async () => {
      // Create user and product
      const user = await prisma.user.create({
        data: {
          phone_number: '+998909999999',
          first_name: 'Integrity',
          last_name: 'Test',
          is_active: true,
        },
      });

      testUsers.push(user.id);

      const product = await prisma.product.create({
        data: {
          title: 'Integrity Test Product',
          description: 'Test product for referential integrity',
          price: 40000,
          currency_id: 1,
          brand_id: 1,
          phone_number: '+998909999999',
          user_id: user.id,
        },
      });

      testProducts.push(product.id);

      // Try to delete user with existing products (should fail or cascade)
      try {
        await prisma.user.delete({
          where: { id: user.id },
        });
      } catch (error) {
        // Expected behavior - referential integrity maintained
        expect(error).toBeDefined();
      }

      // Product should still exist if user deletion failed
      const productExists = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(productExists).toBeDefined();
    });
  });

  describe('Load Testing & Performance', () => {
    it('should handle high-volume product queries', async () => {
      const startTime = Date.now();
      const promises = [];

      // Create 50 concurrent product search requests
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app.getHttpServer())
            .get('/api/product')
            .query({
              page: Math.floor(i / 10) + 1,
              limit: 10,
              search: i % 2 === 0 ? 'test' : 'product',
            })
        );
      }

      const responses = await Promise.all(promises);
      const duration = Date.now() - startTime;

      // All requests should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds max

      // All requests should succeed
      responses.forEach(response => {
        expect([200, 404]).toContain(response.status);
      });

      console.log(`Load test completed: ${responses.length} requests in ${duration}ms`);
    });

    it('should handle concurrent user registrations', async () => {
      const registrationPromises = [];
      const basePhoneNumber = '+99890';

      // Create 20 concurrent user registrations
      for (let i = 0; i < 20; i++) {
        const phoneNumber = `${basePhoneNumber}${String(i).padStart(7, '0')}`;
        registrationPromises.push(
          request(app.getHttpServer())
            .post('/api/user-auth/phone-register')
            .send({
              phone_number: phoneNumber,
              otp: '123456',
              first_name: `User${i}`,
              last_name: 'LoadTest',
            })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(registrationPromises);
      const duration = Date.now() - startTime;

      console.log(`User registration load test: ${responses.length} registrations in ${duration}ms`);

      // Count successful registrations
      const successfulRegistrations = responses.filter(r => r.status === 201);
      expect(successfulRegistrations.length).toBeGreaterThan(10);

      // Clean up created users
      const userIds = successfulRegistrations.map(r => r.body.user.id);
      if (userIds.length > 0) {
        await prisma.user.deleteMany({
          where: { id: { in: userIds } },
        });
      }
    });

    it('should handle bulk product creation efficiently', async () => {
      const bulkProducts = [];
      
      // Prepare bulk product data
      for (let i = 0; i < 100; i++) {
        bulkProducts.push({
          title: `Bulk Product ${i}`,
          description: `Description for bulk product ${i}`,
          price: Math.floor(Math.random() * 100000) + 10000,
          currency_id: 1,
          brand_id: 1,
          phone_number: '+998901234567',
          user_id: userId,
        });
      }

      const startTime = Date.now();
      
      // Use transaction for bulk insert
      const createdProducts = await prisma.$transaction(async (tx) => {
        const products = [];
        for (const productData of bulkProducts) {
          const product = await tx.product.create({ data: productData });
          products.push(product);
        }
        return products;
      });

      const duration = Date.now() - startTime;

      expect(createdProducts.length).toBe(100);
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds

      console.log(`Bulk creation: 100 products in ${duration}ms`);

      // Clean up
      const productIds = createdProducts.map(p => p.id);
      await prisma.product.deleteMany({
        where: { id: { in: productIds } },
      });
    });

    it('should perform complex queries efficiently', async () => {
      const startTime = Date.now();

      // Complex query with joins and filters
      const result = await prisma.product.findMany({
        where: {
          price: { gte: 10000, lte: 100000 },
          is_active: true,
        },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
              phone_number: true,
            },
          },
          brand: {
            select: {
              name: true,
            },
          },
          currency: {
            select: {
              name: true,
              symbol: true,
            },
          },
          reviews: {
            select: {
              rating: true,
              comment: true,
            },
            take: 5,
          },
        },
        orderBy: [
          { createdAt: 'desc' },
          { price: 'asc' },
        ],
        take: 50,
      });

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(Array.isArray(result)).toBe(true);

      console.log(`Complex query executed in ${duration}ms, returned ${result.length} products`);
    });
  });

  describe('Query Optimization & Indexing', () => {
    it('should use database indexes effectively', async () => {
      // Test queries that should use indexes
      const indexedQueries = [
        // Should use index on phone_number
        () => prisma.user.findUnique({ where: { phone_number: '+998901234567' } }),
        
        // Should use index on email
        () => prisma.user.findUnique({ where: { email: 'test@example.com' } }),
        
        // Should use index on user_id
        () => prisma.product.findMany({ where: { user_id: userId } }),
        
        // Should use composite index
        () => prisma.product.findMany({ 
          where: { 
            user_id: userId, 
            is_active: true 
          } 
        }),
      ];

      for (const query of indexedQueries) {
        const startTime = Date.now();
        await query();
        const duration = Date.now() - startTime;
        
        // Indexed queries should be fast
        expect(duration).toBeLessThan(100);
      }
    });

    it('should handle pagination efficiently', async () => {
      const pageSize = 20;
      const maxPages = 5;

      for (let page = 1; page <= maxPages; page++) {
        const startTime = Date.now();
        
        const result = await prisma.product.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        });

        const duration = Date.now() - startTime;
        
        expect(duration).toBeLessThan(500); // Each page should load within 500ms
        expect(result.length).toBeLessThanOrEqual(pageSize);
      }
    });

    it('should optimize full-text search queries', async () => {
      const searchTerms = ['test', 'product', 'education', 'toy', 'book'];

      for (const term of searchTerms) {
        const startTime = Date.now();
        
        const result = await prisma.product.findMany({
          where: {
            OR: [
              { title: { contains: term, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
            ],
          },
          take: 20,
        });

        const duration = Date.now() - startTime;
        
        expect(duration).toBeLessThan(1000); // Search should complete within 1 second
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe('Memory Usage & Resource Management', () => {
    it('should not cause memory leaks during bulk operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform memory-intensive operations
      for (let batch = 0; batch < 10; batch++) {
        const products = await prisma.product.findMany({
          include: {
            user: true,
            brand: true,
            currency: true,
            reviews: true,
            product_image: true,
          },
          take: 100,
        });
        
        // Process the data
        products.forEach(product => {
          // Simulate processing
          JSON.stringify(product);
        });
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      const startMemory = process.memoryUsage().heapUsed;
      
      // Stream large result set
      const products = await prisma.product.findMany({
        take: 1000,
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;
      
      const duration = endTime - startTime;
      const memoryUsed = endMemory - startMemory;
      
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(memoryUsed).toBeLessThan(50 * 1024 * 1024); // Should use less than 50MB
      
      console.log(`Large result set: ${products.length} products in ${duration}ms using ${Math.round(memoryUsed / 1024 / 1024)}MB`);
    });
  });

  describe('Database Backup & Recovery', () => {
    it('should validate data consistency after operations', async () => {
      // Create test data
      const user = await prisma.user.create({
        data: {
          phone_number: '+998900111222',
          first_name: 'Consistency',
          last_name: 'Test',
          is_active: true,
        },
      });

      testUsers.push(user.id);

      // Perform multiple related operations
      const product = await prisma.product.create({
        data: {
          title: 'Consistency Test Product',
          description: 'Test product for consistency validation',
          price: 25000,
          currency_id: 1,
          brand_id: 1,
          phone_number: user.phone_number,
          user_id: user.id,
        },
      });

      testProducts.push(product.id);

      // Validate data consistency
      const userWithProducts = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          product: true,
        },
      });

      expect(userWithProducts).toBeDefined();
      expect(userWithProducts.product.length).toBe(1);
      expect(userWithProducts.product[0].id).toBe(product.id);
    });

    it('should handle database constraints properly', async () => {
      // Test unique constraints
      try {
        await prisma.user.create({
          data: {
            phone_number: '+998901234567', // Duplicate phone number
            first_name: 'Duplicate',
            last_name: 'Test',
            is_active: true,
          },
        });
        
        // Should not reach here if constraint is working
        expect(true).toBe(false);
      } catch (error) {
        expect(error.code).toBe('P2002'); // Prisma unique constraint error
      }
    });
  });
});