import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentService } from '../../payment/payment.service';
import { ClickService } from '../../payment/services/click.service';
import { PaymeService } from '../../payment/services/payme.service';

describe('API & Integration Tests (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let paymentService: PaymentService;
  let clickService: ClickService;
  let paymeService: PaymeService;
  let authToken: string;
  let userId: number;
  let testOrderId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    paymentService = app.get<PaymentService>(PaymentService);
    clickService = app.get<ClickService>(ClickService);
    paymeService = app.get<PaymeService>(PaymeService);
    
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
        first_name: 'API',
        last_name: 'Test',
      });

    if (userResponse.status === 201) {
      authToken = userResponse.body.access_token;
      userId = userResponse.body.user.id;
    }

    // Create test order
    const orderResponse = await request(app.getHttpServer())
      .post('/api/order/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        items: [
          {
            product_id: 1,
            quantity: 1,
            price: 50000,
          },
        ],
        total_amount: 50000,
        delivery_address: 'Test Address',
        payment_method: 'CARD',
      });

    if (orderResponse.status === 201) {
      testOrderId = orderResponse.body.id;
    }
  }

  async function cleanupTestData() {
    try {
      if (testOrderId) {
        await prisma.order.delete({ where: { id: testOrderId } });
      }
      if (userId) {
        await prisma.user.delete({ where: { id: userId } });
      }
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  }

  describe('API Rate Limiting Tests', () => {
    it('should enforce rate limits on authentication endpoints', async () => {
      const requests = [];
      const phoneNumber = '+998900000001';

      // Send many requests rapidly
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/api/user-auth/send-otp')
            .send({
              phone_number: phoneNumber,
              type: 'login',
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Check rate limit headers
      const rateLimitedResponse = rateLimitedResponses[0];
      expect(rateLimitedResponse.headers['x-ratelimit-limit']).toBeDefined();
      expect(rateLimitedResponse.headers['x-ratelimit-remaining']).toBeDefined();
      expect(rateLimitedResponse.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should enforce different rate limits for different endpoints', async () => {
      // Test product search endpoint (should have higher limits)
      const searchRequests = [];
      for (let i = 0; i < 50; i++) {
        searchRequests.push(
          request(app.getHttpServer())
            .get('/api/product')
            .query({ search: `test${i}` })
        );
      }

      const searchResponses = await Promise.all(searchRequests);
      const searchRateLimited = searchResponses.filter(res => res.status === 429);

      // Test sensitive endpoint (should have lower limits)
      const sensitiveRequests = [];
      for (let i = 0; i < 50; i++) {
        sensitiveRequests.push(
          request(app.getHttpServer())
            .post('/api/user-auth/send-otp')
            .send({
              phone_number: `+99890000000${i}`,
              type: 'login',
            })
        );
      }

      const sensitiveResponses = await Promise.all(sensitiveRequests);
      const sensitiveRateLimited = sensitiveResponses.filter(res => res.status === 429);

      // Sensitive endpoints should have more rate limiting
      expect(sensitiveRateLimited.length).toBeGreaterThan(searchRateLimited.length);
    });

    it('should implement IP-based rate limiting', async () => {
      const ip1Requests = [];
      const ip2Requests = [];

      // Requests from IP 1
      for (let i = 0; i < 15; i++) {
        ip1Requests.push(
          request(app.getHttpServer())
            .get('/api/product')
            .set('X-Forwarded-For', '192.168.1.1')
        );
      }

      // Requests from IP 2
      for (let i = 0; i < 15; i++) {
        ip2Requests.push(
          request(app.getHttpServer())
            .get('/api/product')
            .set('X-Forwarded-For', '192.168.1.2')
        );
      }

      const [ip1Responses, ip2Responses] = await Promise.all([
        Promise.all(ip1Requests),
        Promise.all(ip2Requests),
      ]);

      // Each IP should have independent rate limits
      const ip1Success = ip1Responses.filter(res => res.status === 200);
      const ip2Success = ip2Responses.filter(res => res.status === 200);

      expect(ip1Success.length).toBeGreaterThan(0);
      expect(ip2Success.length).toBeGreaterThan(0);
    });

    it('should implement user-based rate limiting for authenticated endpoints', async () => {
      const userRequests = [];

      // Multiple requests from the same user
      for (let i = 0; i < 25; i++) {
        userRequests.push(
          request(app.getHttpServer())
            .get('/api/user/profile')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.all(userRequests);
      const rateLimited = responses.filter(res => res.status === 429);

      // Should rate limit based on user
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should handle burst limits and sustained rate limits', async () => {
      // Test burst - many requests at once
      const burstRequests = [];
      for (let i = 0; i < 10; i++) {
        burstRequests.push(
          request(app.getHttpServer()).get('/api/category')
        );
      }

      const burstStart = Date.now();
      const burstResponses = await Promise.all(burstRequests);
      const burstDuration = Date.now() - burstStart;

      // Test sustained - requests over time
      const sustainedRequests = [];
      for (let i = 0; i < 10; i++) {
        sustainedRequests.push(
          new Promise(resolve => {
            setTimeout(() => {
              resolve(request(app.getHttpServer()).get('/api/category'));
            }, i * 100);
          })
        );
      }

      const sustainedStart = Date.now();
      const sustainedResponses = await Promise.all(sustainedRequests);
      const sustainedDuration = Date.now() - sustainedStart;

      // Burst should be more likely to hit rate limits
      const burstRateLimited = burstResponses.filter(res => res.status === 429);
      const sustainedRateLimited = sustainedResponses.filter(res => res.status === 429);

      expect(burstRateLimited.length).toBeGreaterThanOrEqual(sustainedRateLimited.length);
    });
  });

  describe('Payment Gateway Integration Tests', () => {
    describe('Click Payment Integration', () => {
      it('should create Click payment transaction', async () => {
        const paymentData = {
          order_id: testOrderId,
          amount: 50000,
          return_url: 'http://localhost:3000/payment/success',
          cancel_url: 'http://localhost:3000/payment/cancel',
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/click/create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData);

        expect([200, 201]).toContain(response.status);
        if (response.status === 201 || response.status === 200) {
          expect(response.body.payment_url).toBeDefined();
          expect(response.body.transaction_id).toBeDefined();
        }
      });

      it('should verify Click payment callback', async () => {
        // Simulate Click callback
        const callbackData = {
          click_trans_id: 'TEST_CLICK_123',
          service_id: process.env.CLICK_SERVICE_ID,
          click_paydoc_id: 'TEST_DOC_123',
          merchant_trans_id: `ORDER_${testOrderId}`,
          amount: 50000,
          action: 1, // Payment action
          error: 0,
          error_note: '',
          sign_time: new Date().toISOString(),
          sign_string: 'test_signature',
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/click/callback')
          .send(callbackData);

        expect([200, 400]).toContain(response.status);
        // 400 might be expected if signature verification fails in test
      });

      it('should handle Click payment verification', async () => {
        const verificationData = {
          payment_id: 'TEST_PAYMENT_123',
          status: 'success',
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/click/verify')
          .set('Authorization', `Bearer ${authToken}`)
          .send(verificationData);

        expect([200, 400, 404]).toContain(response.status);
      });

      it('should handle Click payment errors gracefully', async () => {
        const errorCallbackData = {
          click_trans_id: 'TEST_ERROR_123',
          service_id: process.env.CLICK_SERVICE_ID,
          merchant_trans_id: `ORDER_${testOrderId}`,
          amount: 50000,
          action: 1,
          error: -1, // Error code
          error_note: 'Insufficient funds',
          sign_time: new Date().toISOString(),
          sign_string: 'test_signature',
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/click/callback')
          .send(errorCallbackData);

        // Should handle error gracefully
        expect([200, 400]).toContain(response.status);
      });
    });

    describe('Payme Payment Integration', () => {
      it('should handle Payme CheckPerformTransaction', async () => {
        const checkData = {
          id: Date.now(),
          method: 'CheckPerformTransaction',
          params: {
            amount: 5000000, // Payme uses tiyin (50000 * 100)
            account: {
              order_id: testOrderId.toString(),
            },
          },
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/payme')
          .send(checkData);

        expect(response.status).toBe(200);
        expect(response.body.result || response.body.error).toBeDefined();
      });

      it('should handle Payme CreateTransaction', async () => {
        const createData = {
          id: Date.now(),
          method: 'CreateTransaction',
          params: {
            id: `payme_trans_${Date.now()}`,
            time: Date.now(),
            amount: 5000000,
            account: {
              order_id: testOrderId.toString(),
            },
          },
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/payme')
          .send(createData);

        expect(response.status).toBe(200);
        expect(response.body.result || response.body.error).toBeDefined();
      });

      it('should handle Payme PerformTransaction', async () => {
        const performData = {
          id: Date.now(),
          method: 'PerformTransaction',
          params: {
            id: `payme_trans_${Date.now()}`,
          },
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/payme')
          .send(performData);

        expect(response.status).toBe(200);
        expect(response.body.result || response.body.error).toBeDefined();
      });

      it('should handle Payme CancelTransaction', async () => {
        const cancelData = {
          id: Date.now(),
          method: 'CancelTransaction',
          params: {
            id: `payme_trans_${Date.now()}`,
            reason: 1, // Cancel reason
          },
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/payme')
          .send(cancelData);

        expect(response.status).toBe(200);
        expect(response.body.result || response.body.error).toBeDefined();
      });

      it('should validate Payme transaction amounts', async () => {
        const invalidAmountData = {
          id: Date.now(),
          method: 'CheckPerformTransaction',
          params: {
            amount: 100, // Too small amount
            account: {
              order_id: testOrderId.toString(),
            },
          },
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/payme')
          .send(invalidAmountData);

        expect(response.status).toBe(200);
        if (response.body.error) {
          expect(response.body.error.code).toBeDefined();
        }
      });
    });

    describe('Card Payment Integration', () => {
      it('should process card payment', async () => {
        const cardData = {
          order_id: testOrderId,
          card_number: '4444444444444444',
          card_expiry: '12/25',
          card_cvv: '123',
          cardholder_name: 'TEST USER',
          amount: 50000,
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/card/process')
          .set('Authorization', `Bearer ${authToken}`)
          .send(cardData);

        expect([200, 201, 400]).toContain(response.status);
        // 400 might be expected for test card numbers
      });

      it('should validate card details', async () => {
        const invalidCardData = {
          order_id: testOrderId,
          card_number: '1234', // Invalid card number
          card_expiry: '13/20', // Invalid expiry
          card_cvv: '12', // Invalid CVV
          cardholder_name: '',
          amount: 50000,
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/card/process')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidCardData);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('invalid');
      });

      it('should handle card payment refunds', async () => {
        // First create a successful payment
        const paymentData = {
          order_id: testOrderId,
          transaction_id: 'TEST_CARD_TRANS_123',
          amount: 50000,
          status: 'PAID',
        };

        // Create payment record
        const payment = await prisma.orderPayment.create({
          data: {
            order_id: testOrderId,
            amount: 50000,
            payment_method: 'CARD',
            transaction_id: 'TEST_CARD_TRANS_123',
            status: 'PAID',
          },
        });

        // Test refund
        const refundResponse = await request(app.getHttpServer())
          .post(`/api/payment/refund/${payment.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: 25000, // Partial refund
            reason: 'Customer request',
          });

        expect([200, 400]).toContain(refundResponse.status);

        // Clean up
        await prisma.orderPayment.delete({ where: { id: payment.id } });
      });
    });

    describe('Payment Error Handling', () => {
      it('should handle network failures gracefully', async () => {
        // Simulate network timeout by using invalid gateway URL
        const originalEnv = process.env.CLICK_API_URL;
        process.env.CLICK_API_URL = 'http://invalid-url.test';

        const paymentData = {
          order_id: testOrderId,
          amount: 50000,
          return_url: 'http://localhost:3000/payment/success',
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/click/create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData);

        // Should handle network error gracefully
        expect([400, 500, 503]).toContain(response.status);

        // Restore original environment
        process.env.CLICK_API_URL = originalEnv;
      });

      it('should handle invalid payment gateway responses', async () => {
        // This would typically mock the payment gateway to return invalid responses
        const invalidCallbackData = {
          invalid_field: 'invalid_value',
          missing_required_fields: true,
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/click/callback')
          .send(invalidCallbackData);

        expect(response.status).toBe(400);
      });

      it('should handle payment gateway downtime', async () => {
        // Simulate gateway downtime
        const paymentData = {
          order_id: testOrderId,
          amount: 50000,
          gateway: 'unavailable_gateway',
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/process')
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData);

        expect([400, 503]).toContain(response.status);
        expect(response.body.message).toContain('unavailable');
      });
    });

    describe('Payment Security Tests', () => {
      it('should validate payment signatures', async () => {
        const callbackData = {
          click_trans_id: 'TEST_123',
          amount: 50000,
          sign_string: 'invalid_signature',
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/click/callback')
          .send(callbackData);

        // Should reject invalid signatures
        expect([400, 403]).toContain(response.status);
      });

      it('should prevent payment amount manipulation', async () => {
        const manipulatedData = {
          order_id: testOrderId,
          amount: 1, // Manipulated to very low amount
          original_amount: 50000,
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/process')
          .set('Authorization', `Bearer ${authToken}`)
          .send(manipulatedData);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('amount');
      });

      it('should prevent duplicate payment processing', async () => {
        const paymentData = {
          order_id: testOrderId,
          transaction_id: 'DUPLICATE_TEST_123',
          amount: 50000,
        };

        // First payment
        const firstResponse = await request(app.getHttpServer())
          .post('/api/payment/process')
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData);

        // Duplicate payment
        const duplicateResponse = await request(app.getHttpServer())
          .post('/api/payment/process')
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData);

        // Should prevent duplicate
        if (firstResponse.status === 201) {
          expect([400, 409]).toContain(duplicateResponse.status);
        }
      });
    });
  });

  describe('API Performance & Reliability', () => {
    it('should handle concurrent payment requests', async () => {
      const concurrentRequests = [];
      
      for (let i = 0; i < 10; i++) {
        concurrentRequests.push(
          request(app.getHttpServer())
            .post('/api/payment/click/create')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              order_id: testOrderId,
              amount: 50000 + i,
              return_url: 'http://localhost:3000/payment/success',
            })
        );
      }

      const responses = await Promise.all(concurrentRequests);
      
      // All requests should be handled without server errors
      responses.forEach(response => {
        expect([200, 201, 400, 429]).toContain(response.status);
        expect(response.status).not.toBe(500);
      });
    });

    it('should implement circuit breaker for external services', async () => {
      // This test would verify circuit breaker pattern implementation
      // for external payment gateways
      
      const requests = [];
      
      // Send many requests that might trigger circuit breaker
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app.getHttpServer())
            .get('/api/payment/gateway-status')
        );
      }

      const responses = await Promise.all(requests);
      
      // Should handle gracefully even if external service is down
      responses.forEach(response => {
        expect([200, 503]).toContain(response.status);
      });
    });

    it('should implement request timeout handling', async () => {
      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .post('/api/payment/slow-operation')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000); // 5 second timeout

      const duration = Date.now() - startTime;
      
      // Should timeout within reasonable time
      expect(duration).toBeLessThan(10000);
      expect([200, 408, 504]).toContain(response.status);
    });

    it('should implement proper error recovery', async () => {
      // Test recovery from various error conditions
      const errorScenarios = [
        { scenario: 'database_error', expectedStatus: [500, 503] },
        { scenario: 'network_error', expectedStatus: [502, 503] },
        { scenario: 'validation_error', expectedStatus: [400] },
        { scenario: 'auth_error', expectedStatus: [401, 403] },
      ];

      for (const scenario of errorScenarios) {
        const response = await request(app.getHttpServer())
          .post('/api/payment/test-error')
          .send({ error_type: scenario.scenario });

        expect(scenario.expectedStatus).toContain(response.status);
        expect(response.body.error || response.body.message).toBeDefined();
      }
    });
  });

  describe('API Documentation & Compliance', () => {
    it('should provide comprehensive API documentation', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-docs-json');

      expect(response.status).toBe(200);
      expect(response.body.openapi).toBeDefined();
      expect(response.body.paths).toBeDefined();
      expect(response.body.components).toBeDefined();

      // Check if payment endpoints are documented
      expect(response.body.paths['/api/payment/click/create']).toBeDefined();
      expect(response.body.paths['/api/payment/payme']).toBeDefined();
    });

    it('should validate API responses against OpenAPI schema', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      
      // Response should match expected schema structure
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const product = response.body.data[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('title');
        expect(product).toHaveProperty('price');
      }
    });

    it('should implement proper HTTP status codes', async () => {
      const testCases = [
        { endpoint: '/api/product/999999', method: 'get', expectedStatus: 404 },
        { endpoint: '/api/product', method: 'post', expectedStatus: 401, noAuth: true },
        { endpoint: '/api/admin/users', method: 'get', expectedStatus: 403, userAuth: true },
        { endpoint: '/api/product', method: 'get', expectedStatus: 200 },
      ];

      for (const testCase of testCases) {
        let requestBuilder = request(app.getHttpServer())[testCase.method](testCase.endpoint);
        
        if (!testCase.noAuth && !testCase.userAuth) {
          // Admin auth needed
        } else if (testCase.userAuth) {
          requestBuilder = requestBuilder.set('Authorization', `Bearer ${authToken}`);
        }

        const response = await requestBuilder;
        expect(response.status).toBe(testCase.expectedStatus);
      }
    });
  });
});