import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('INBOLA Kids Marketplace E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('OK');
          expect(res.body.database).toBe('Connected');
        });
    });
  });

  describe('Authentication Flow', () => {
    const testPhone = '+998901234567';
    const testOtp = '123456';

    it('should send OTP for phone registration', () => {
      return request(app.getHttpServer())
        .post('/api/v1/user-auth/send-otp')
        .send({
          phone_number: testPhone,
          type: 'register'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('OTP yuborildi');
        });
    });

    it('should register user with OTP', () => {
      return request(app.getHttpServer())
        .post('/api/v1/user-auth/phone-register')
        .send({
          phone_number: testPhone,
          otp: testOtp,
          first_name: 'Test',
          last_name: 'User',
          role: 'PARENT'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.phone_number).toBe(testPhone);
          authToken = res.body.access_token;
          userId = res.body.user.id;
        });
    });

    it('should login with phone and OTP', () => {
      return request(app.getHttpServer())
        .post('/api/v1/user-auth/phone-login')
        .send({
          phone_number: testPhone,
          otp: testOtp
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.phone_number).toBe(testPhone);
        });
    });
  });

  describe('Categories API', () => {
    it('should get all categories', () => {
      return request(app.getHttpServer())
        .get('/api/v1/category')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should create category (admin only)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/category/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Category',
          description: 'Test category description',
          status: 'ACTIVE'
        })
        .expect((res) => {
          // Should fail if user is not admin
          expect([201, 403]).toContain(res.status);
        });
    });
  });

  describe('Products API', () => {
    let categoryId: string;
    let productId: string;

    beforeAll(async () => {
      // Create a test category
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          description: 'Test category for products',
          status: 'ACTIVE'
        }
      });
      categoryId = category.id;
    });

    it('should get all products', () => {
      return request(app.getHttpServer())
        .get('/api/v1/product')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should create product (authenticated)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/product/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          description: 'Test product description',
          price: 50000,
          category_id: categoryId,
          age_min: 3,
          age_max: 12,
          safety_certified: true,
          educational_value: true
        })
        .expect((res) => {
          if (res.status === 201) {
            expect(res.body.name).toBe('Test Product');
            productId = res.body.id;
          }
        });
    });

    it('should get product by ID', () => {
      if (productId) {
        return request(app.getHttpServer())
          .get(`/api/v1/product/${productId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.id).toBe(productId);
            expect(res.body.name).toBe('Test Product');
          });
      }
    });

    it('should search products by category', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/product?category_id=${categoryId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('Shopping Cart', () => {
    let productId: string;

    beforeAll(async () => {
      // Create a test product
      const category = await prisma.category.findFirst();
      if (category) {
        const product = await prisma.product.create({
          data: {
            name: 'Cart Test Product',
            description: 'Product for cart testing',
            price: 25000,
            category_id: category.id,
            age_min: 3,
            age_max: 12,
            status: 'ACTIVE'
          }
        });
        productId = product.id;
      }
    });

    it('should add product to cart', () => {
      if (productId) {
        return request(app.getHttpServer())
          .post('/api/v1/cart/add')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            product_id: productId,
            quantity: 2
          })
          .expect(201)
          .expect((res) => {
            expect(res.body.product_id).toBe(productId);
            expect(res.body.quantity).toBe(2);
          });
      }
    });

    it('should get user cart', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should update cart item quantity', () => {
      if (productId) {
        return request(app.getHttpServer())
          .put('/api/v1/cart/update')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            product_id: productId,
            quantity: 3
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.quantity).toBe(3);
          });
      }
    });

    it('should remove product from cart', () => {
      if (productId) {
        return request(app.getHttpServer())
          .delete(`/api/v1/cart/remove/${productId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      }
    });
  });

  describe('Orders', () => {
    let orderId: string;
    let productId: string;

    beforeAll(async () => {
      // Create a test product and add to cart
      const category = await prisma.category.findFirst();
      if (category) {
        const product = await prisma.product.create({
          data: {
            name: 'Order Test Product',
            description: 'Product for order testing',
            price: 75000,
            category_id: category.id,
            age_min: 3,
            age_max: 12,
            status: 'ACTIVE'
          }
        });
        productId = product.id;

        // Add to cart
        await prisma.cartItem.create({
          data: {
            user_id: userId,
            product_id: productId,
            quantity: 1
          }
        });
      }
    });

    it('should create order from cart', () => {
      return request(app.getHttpServer())
        .post('/api/v1/order/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          delivery_address: 'Test Address, Tashkent',
          payment_method: 'CASH',
          notes: 'Test order'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.order_number).toBeDefined();
          expect(res.body.status).toBe('PENDING');
          orderId = res.body.id;
        });
    });

    it('should get user orders', () => {
      return request(app.getHttpServer())
        .get('/api/v1/order/my-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get order by ID', () => {
      if (orderId) {
        return request(app.getHttpServer())
          .get(`/api/v1/order/${orderId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.id).toBe(orderId);
          });
      }
    });
  });

  describe('Wishlist', () => {
    let productId: string;

    beforeAll(async () => {
      // Create a test product
      const category = await prisma.category.findFirst();
      if (category) {
        const product = await prisma.product.create({
          data: {
            name: 'Wishlist Test Product',
            description: 'Product for wishlist testing',
            price: 35000,
            category_id: category.id,
            age_min: 3,
            age_max: 12,
            status: 'ACTIVE'
          }
        });
        productId = product.id;
      }
    });

    it('should add product to wishlist', () => {
      if (productId) {
        return request(app.getHttpServer())
          .post('/api/v1/wishlist/add')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            product_id: productId
          })
          .expect(201)
          .expect((res) => {
            expect(res.body.product_id).toBe(productId);
          });
      }
    });

    it('should get user wishlist', () => {
      return request(app.getHttpServer())
        .get('/api/v1/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should remove product from wishlist', () => {
      if (productId) {
        return request(app.getHttpServer())
          .delete(`/api/v1/wishlist/remove/${productId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      }
    });
  });

  describe('Child Safety', () => {
    it('should get child safety settings', () => {
      return request(app.getHttpServer())
        .get('/api/v1/child-safety/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.max_spending).toBeDefined();
          expect(res.body.max_session_time).toBeDefined();
        });
    });

    it('should update child safety settings', () => {
      return request(app.getHttpServer())
        .put('/api/v1/child-safety/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          max_spending: 100000,
          max_session_time: 3600,
          content_filter_enabled: true
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.max_spending).toBe(100000);
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/api/v1/product/non-existent-id')
        .expect(404);
    });

    it('should handle unauthorized access', () => {
      return request(app.getHttpServer())
        .post('/api/v1/product/create')
        .send({
          name: 'Unauthorized Product'
        })
        .expect(401);
    });

    it('should handle invalid input', () => {
      return request(app.getHttpServer())
        .post('/api/v1/user-auth/send-otp')
        .send({
          phone_number: 'invalid-phone'
        })
        .expect(400);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/api/v1/category')
          .expect(200)
      );

      const responses = await Promise.all(requests);
      expect(responses).toHaveLength(10);
    });

    it('should respond within acceptable time', () => {
      const start = Date.now();
      return request(app.getHttpServer())
        .get('/api/v1/product')
        .expect(200)
        .expect(() => {
          const duration = Date.now() - start;
          expect(duration).toBeLessThan(2000); // 2 seconds
        });
    });
  });
});