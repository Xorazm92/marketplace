import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('INBOLA API Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
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
          expect(res.body).toHaveProperty('status', 'OK');
          expect(res.body).toHaveProperty('database', 'Connected');
          expect(res.body).toHaveProperty('services');
        });
    });
  });

  describe('Categories API', () => {
    it('/api/v1/category (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/category')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('name');
            expect(res.body[0]).toHaveProperty('slug');
          }
        });
    });

    it('/api/v1/category/:id (GET)', async () => {
      // First get all categories to get a valid ID
      const categoriesResponse = await request(app.getHttpServer())
        .get('/api/v1/category');
      
      if (categoriesResponse.body.length > 0) {
        const categoryId = categoriesResponse.body[0].id;
        
        return request(app.getHttpServer())
          .get(`/api/v1/category/${categoryId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('id', categoryId);
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('slug');
          });
      }
    });
  });

  describe('Products API', () => {
    it('/api/v1/product (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/product')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('title');
            expect(res.body[0]).toHaveProperty('price');
            expect(res.body[0]).toHaveProperty('description');
          }
        });
    });

    it('/api/v1/product with pagination (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/product?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeLessThanOrEqual(5);
        });
    });

    it('/api/v1/product with search (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/product?search=bolalar')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Brands API', () => {
    it('/api/v1/brand (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/brand')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('name');
            expect(res.body[0]).toHaveProperty('slug');
          }
        });
    });
  });

  describe('Currency API', () => {
    it('/api/v1/currency (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/currency')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('name');
            expect(res.body[0]).toHaveProperty('code');
            expect(res.body[0]).toHaveProperty('symbol');
          }
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', () => {
      return request(app.getHttpServer())
        .get('/api/v1/nonexistent')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/api/v1/product/99999')
        .expect(404);
    });

    it('should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .get('/api/v1/category/99999')
        .expect(404);
    });
  });

  describe('CORS and Security Headers', () => {
    it('should include security headers', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          // Check for basic security headers
          expect(res.headers).toHaveProperty('x-frame-options');
        });
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple requests', async () => {
      const promises = Array(10).fill(null).map(() => 
        request(app.getHttpServer()).get('/health')
      );
      
      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Database Connection', () => {
    it('should connect to database successfully', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toBeDefined();
    });

    it('should have seeded data', async () => {
      const categories = await prisma.category.findMany();
      expect(categories.length).toBeGreaterThan(0);

      const products = await prisma.product.findMany();
      expect(products.length).toBeGreaterThan(0);

      const brands = await prisma.brand.findMany();
      expect(brands.length).toBeGreaterThan(0);
    });
  });
});
