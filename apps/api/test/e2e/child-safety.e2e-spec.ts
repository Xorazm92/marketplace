
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestUtils, SecurityTestHelpers } from '../../src/testing/test-utils';

describe('Child Safety (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let childAccessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create test users and get tokens
    const parentUser = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        first_name: 'Parent',
        last_name: 'User',
        email: 'parent@test.com',
        password: 'SecurePass123!',
        age: 35,
      });

    const childUser = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        first_name: 'Child',
        last_name: 'User',
        email: 'child@test.com',
        password: 'SecurePass123!',
        age: 8,
        role: 'child',
        parent_id: parentUser.body.user.id,
      });

    accessToken = parentUser.body.accessToken;
    childAccessToken = childUser.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Product Content Safety', () => {
    it('should block inappropriate product creation', async () => {
      const inappropriateProduct = {
        title: 'Violent toy gun',
        description: 'Realistic weapon for aggressive play',
        price: 29.99,
        category_id: 1,
        brand_id: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(inappropriateProduct);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('inappropriate');
    });

    it('should approve educational products', async () => {
      const educationalProduct = {
        title: 'Educational math blocks',
        description: 'Learning toy for developing math skills in children',
        price: 19.99,
        category_id: 1,
        brand_id: 1,
        is_educational: true,
      };

      const response = await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(educationalProduct);

      expect(response.status).toBe(201);
      expect(response.body.is_educational).toBe(true);
    });
  });

  describe('Age-Appropriate Content Filtering', () => {
    let productId: number;

    beforeAll(async () => {
      // Create a product for testing
      const product = await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Safe Educational Toy',
          description: 'Perfect for early elementary children',
          price: 24.99,
          category_id: 1,
          brand_id: 1,
          age_group: 'Early Elementary',
        });

      productId = product.body.id;
    });

    it('should show age-appropriate products to children', async () => {
      const response = await request(app.getHttpServer())
        .get('/product')
        .set('Authorization', `Bearer ${childAccessToken}`)
        .query({ age_filter: true });

      expect(response.status).toBe(200);
      const products = response.body.products;
      
      // All products should be age-appropriate for 8-year-old
      products.forEach((product: any) => {
        expect(['Infants', 'Toddlers', 'Early Elementary']).toContain(product.age_group);
      });
    });

    it('should hide inappropriate age products from children', async () => {
      // Create a teen product
      const teenProduct = await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Teen Fashion Item',
          description: 'Fashion for teenagers',
          price: 49.99,
          category_id: 2,
          brand_id: 1,
          age_group: 'Teens',
        });

      const response = await request(app.getHttpServer())
        .get('/product')
        .set('Authorization', `Bearer ${childAccessToken}`)
        .query({ age_filter: true });

      const products = response.body.products;
      const teenProductInResults = products.find((p: any) => p.id === teenProduct.body.id);
      
      expect(teenProductInResults).toBeUndefined();
    });
  });

  describe('Parental Controls', () => {
    it('should enforce time restrictions for children', async () => {
      // Mock current time to be outside allowed hours
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(22); // 10 PM

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${childAccessToken}`)
        .send({
          items: [{ product_id: 1, quantity: 1, unit_price: 19.99 }],
          currency_id: 1,
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('time window');
    });

    it('should enforce spending limits for children', async () => {
      const expensiveOrder = {
        items: [{ product_id: 1, quantity: 10, unit_price: 50 }], // $500 total
        currency_id: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${childAccessToken}`)
        .send(expensiveOrder);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('spending limit');
    });
  });

  describe('Security Tests', () => {
    it('should prevent XSS in product reviews', async () => {
      const maliciousInputs = SecurityTestHelpers.generateMaliciousInputs();

      for (const maliciousInput of maliciousInputs) {
        const response = await request(app.getHttpServer())
          .post('/reviews')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            product_id: 1,
            rating: 5,
            comment: maliciousInput,
          });

        if (response.status === 201) {
          // If created, check that content is sanitized
          expect(response.body.comment).not.toContain('<script>');
          expect(response.body.comment).not.toContain('javascript:');
        }
      }
    });

    it('should enforce rate limiting', async () => {
      await SecurityTestHelpers.testRateLimit(
        request(app.getHttpServer()),
        '/product',
        10
      );
    });

    it('should validate CSRF tokens for sensitive operations', async () => {
      const response = await request(app.getHttpServer())
        .delete('/product/1')
        .set('Authorization', `Bearer ${accessToken}`)
        // Missing CSRF token
        .send();

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('CSRF');
    });
  });

  describe('Review Moderation', () => {
    it('should flag inappropriate review content', async () => {
      const inappropriateReview = {
        product_id: 1,
        rating: 1,
        comment: 'This product is dangerous and violent for children',
      };

      const response = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(inappropriateReview);

      expect(response.status).toBe(201);
      expect(response.body.is_flagged).toBe(true);
      expect(response.body.moderation_status).toBe('PENDING');
    });

    it('should auto-approve safe review content', async () => {
      const safeReview = {
        product_id: 1,
        rating: 5,
        comment: 'Great educational toy! My child learned a lot from it.',
      };

      const response = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(safeReview);

      expect(response.status).toBe(201);
      expect(response.body.is_flagged).toBe(false);
      expect(response.body.moderation_status).toBe('APPROVED');
    });
  });
});
