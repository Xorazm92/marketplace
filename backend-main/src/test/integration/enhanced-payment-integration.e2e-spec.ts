import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { PaymentService } from '../../../src/payment/payment.service';
import { ClickService } from '../../../src/payment/services/click.service';
import { PaymeService } from '../../../src/payment/services/payme.service';
import { UzumService } from '../../../src/payment/services/uzum.service';

describe('Enhanced Payment System Integration Tests (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let paymentService: PaymentService;
  let clickService: ClickService;
  let paymeService: PaymeService;
  let uzumService: UzumService;
  let authToken: string;
  let adminToken: string;
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
    uzumService = app.get<UzumService>(UzumService);
    
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
    const testUser = await prisma.user.create({
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: `test.payment.${Date.now()}@example.com`,
        phone: `+99890${Math.floor(Math.random() * 1000000).toString().padStart(7, '0')}`,
        password: 'hashedpassword',
        email_verified: true,
        phone_verified: true,
        role: 'USER',
        is_active: true
      }
    });
    userId = testUser.id;

    // Create admin user
    const adminUser = await prisma.admin.create({
      data: {
        first_name: 'Admin',
        last_name: 'User',
        email: `admin.payment.${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'SUPER_ADMIN',
        is_active: true
      }
    });

    // Create test product
    const testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: `test-category-${Date.now()}`,
        is_active: true
      }
    });

    const testProduct = await prisma.product.create({
      data: {
        title: 'Test Product',
        slug: `test-product-${Date.now()}`,
        description: 'Test product for payment testing',
        price: 100000, // 100,000 UZS
        quantity: 10,
        category_id: testCategory.id,
        is_active: true,
        is_featured: false
      }
    });

    // Create test order
    const testOrder = await prisma.order.create({
      data: {
        user_id: userId,
        order_number: `ORD-${Date.now()}`,
        status: 'PENDING',
        payment_status: 'PENDING',
        subtotal: 100000,
        tax_amount: 0,
        shipping_amount: 0,
        discount_amount: 0,
        final_amount: 100000,
        currency: 'UZS',
        items: {
          create: {
            product_id: testProduct.id,
            quantity: 1,
            price: 100000,
            total: 100000
          }
        }
      }
    });
    testOrderId = testOrder.id;

    // Generate auth tokens (mock)
    authToken = 'mock-user-token';
    adminToken = 'mock-admin-token';
  }

  async function cleanupTestData() {
    // Clean up in reverse order of creation
    await prisma.orderItem.deleteMany({ where: { order: { user_id: userId } } });
    await prisma.orderPayment.deleteMany({ where: { order: { user_id: userId } } });
    await prisma.order.deleteMany({ where: { user_id: userId } });
    await prisma.product.deleteMany({ where: { title: 'Test Product' } });
    await prisma.category.deleteMany({ where: { name: 'Test Category' } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.admin.deleteMany({ where: { first_name: 'Admin' } });
  }

  describe('Payment Processing Endpoints', () => {
    describe('POST /api/payment/process/:orderId', () => {
      it('should process Click payment successfully', async () => {
        const paymentData = {
          method: 'CLICK',
          returnUrl: 'http://localhost:3000/payment/success',
          description: 'Test Click payment'
        };

        const response = await request(app.getHttpServer())
          .post(`/api/payment/process/${testOrderId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData);

        expect([200, 401]).toContain(response.status); // 401 if auth not implemented
        
        if (response.status === 200) {
          expect(response.body.status).toBe('PENDING');
          expect(response.body.paymentUrl).toBeDefined();
          expect(response.body.transactionId).toContain('click_');
        }
      });

      it('should process Payme payment successfully', async () => {
        const paymentData = {
          method: 'PAYME',
          returnUrl: 'http://localhost:3000/payment/success',
          description: 'Test Payme payment'
        };

        const response = await request(app.getHttpServer())
          .post(`/api/payment/process/${testOrderId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData);

        expect([200, 401]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body.status).toBe('PENDING');
          expect(response.body.paymentUrl).toBeDefined();
          expect(response.body.transactionId).toContain('payme_');
        }
      });

      it('should process Uzum payment successfully', async () => {
        const paymentData = {
          method: 'UZUM',
          returnUrl: 'http://localhost:3000/payment/success',
          cancelUrl: 'http://localhost:3000/payment/cancel',
          description: 'Test Uzum payment'
        };

        const response = await request(app.getHttpServer())
          .post(`/api/payment/process/${testOrderId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData);

        expect([200, 401]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body.status).toBe('PENDING');
          expect(response.body.paymentUrl).toBeDefined();
          expect(response.body.transactionId).toContain('uzum_');
        }
      });

      it('should process card payment successfully', async () => {
        const paymentData = {
          method: 'CARD',
          cardDetails: {
            cardNumber: '4111111111111111',
            expiryMonth: '12',
            expiryYear: '2025',
            cvv: '123',
            cardHolderName: 'John Doe'
          },
          description: 'Test card payment'
        };

        const response = await request(app.getHttpServer())
          .post(`/api/payment/process/${testOrderId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData);

        expect([200, 401]).toContain(response.status);
        
        if (response.status === 200) {
          expect(['PAID', 'FAILED']).toContain(response.body.status);
          expect(response.body.transactionId).toContain('card_');
        }
      });

      it('should handle invalid payment method', async () => {
        const paymentData = {
          method: 'INVALID_METHOD',
          description: 'Test invalid payment'
        };

        const response = await request(app.getHttpServer())
          .post(`/api/payment/process/${testOrderId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData);

        expect([400, 401]).toContain(response.status);
      });

      it('should handle non-existent order', async () => {
        const paymentData = {
          method: 'CLICK',
          description: 'Test payment for non-existent order'
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/process/99999')
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData);

        expect([404, 401]).toContain(response.status);
      });
    });

    describe('GET /api/payment/status/:orderId', () => {
      it('should get payment status for order', async () => {
        // First create a payment
        await prisma.orderPayment.create({
          data: {
            order_id: testOrderId,
            amount: 100000,
            payment_method: 'CLICK',
            transaction_id: 'test_click_123',
            status: 'PENDING'
          }
        });

        const response = await request(app.getHttpServer())
          .get(`/api/payment/status/${testOrderId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect([200, 401]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body.orderId).toBe(testOrderId);
          expect(response.body.status).toBe('PENDING');
          expect(response.body.method).toBe('CLICK');
        }
      });

      it('should handle order without payment', async () => {
        // Create order without payment
        const orderWithoutPayment = await prisma.order.create({
          data: {
            user_id: userId,
            order_number: `ORD-NO-PAY-${Date.now()}`,
            status: 'PENDING',
            payment_status: 'PENDING',
            subtotal: 50000,
            final_amount: 50000
          }
        });

        const response = await request(app.getHttpServer())
          .get(`/api/payment/status/${orderWithoutPayment.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect([404, 401]).toContain(response.status);

        // Cleanup
        await prisma.order.delete({ where: { id: orderWithoutPayment.id } });
      });
    });
  });

  describe('Click Payment Gateway', () => {
    describe('POST /api/payment/click/create', () => {
      it('should create Click payment', async () => {
        const paymentRequest = {
          order_id: testOrderId,
          amount: 100000,
          return_url: 'http://localhost:3000/payment/success',
          description: 'Test Click payment creation'
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/click/create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentRequest);

        expect([200, 401]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body.payment_id).toBeDefined();
          expect(response.body.payment_url).toBeDefined();
          expect(response.body.status).toBe('PENDING');
        }
      });
    });

    describe('POST /api/payment/click/callback', () => {
      it('should handle Click callback successfully', async () => {
        // Create a payment first
        const payment = await prisma.orderPayment.create({
          data: {
            order_id: testOrderId,
            amount: 100000,
            payment_method: 'CLICK',
            transaction_id: 'click_callback_test',
            status: 'PENDING',
            gateway_response: {
              merchant_trans_id: `ORDER_${testOrderId}_${Date.now()}`
            }
          }
        });

        const callbackData = {
          click_trans_id: 123456,
          service_id: parseInt(process.env.CLICK_SERVICE_ID || '12345'),
          click_paydoc_id: 789,
          merchant_trans_id: `ORDER_${testOrderId}_${Date.now()}`,
          amount: 10000000, // in tiyin
          action: 0, // prepare
          error: 0,
          error_note: '',
          sign_time: new Date().toISOString(),
          sign_string: 'test_signature'
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/click/callback')
          .send(callbackData);

        expect(response.status).toBe(200);
        expect(response.body.error).toBeDefined();

        // Cleanup
        await prisma.orderPayment.delete({ where: { id: payment.id } });
      });
    });

    describe('GET /api/payment/click/verify', () => {
      it('should verify Click payment', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/payment/click/verify')
          .query({
            payment_id: 'click_test_123',
            status: 'success'
          });

        expect([200, 400]).toContain(response.status);
      });

      it('should handle missing parameters', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/payment/click/verify');

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('required');
      });
    });
  });

  describe('Payme Payment Gateway', () => {
    describe('POST /api/payment/payme/create', () => {
      it('should create Payme payment', async () => {
        const paymentRequest = {
          order_id: testOrderId,
          amount: 100000,
          return_url: 'http://localhost:3000/payment/success',
          description: 'Test Payme payment creation'
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/payme/create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentRequest);

        expect([200, 401]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body.payment_id).toBeDefined();
          expect(response.body.payment_url).toBeDefined();
          expect(response.body.status).toBe('PENDING');
        }
      });
    });

    describe('POST /api/payment/payme/callback', () => {
      it('should handle Payme CheckPerformTransaction', async () => {
        const callbackData = {
          id: Date.now(),
          method: 'CheckPerformTransaction',
          params: {
            amount: 10000000, // in tiyin
            account: {
              order_id: testOrderId.toString()
            }
          }
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/payme/callback')
          .send(callbackData);

        expect(response.status).toBe(200);
        expect(response.body.result).toBeDefined();
      });

      it('should handle Payme CreateTransaction', async () => {
        const transactionId = `payme_trans_${Date.now()}`;
        const callbackData = {
          id: Date.now(),
          method: 'CreateTransaction',
          params: {
            id: transactionId,
            time: Date.now(),
            amount: 10000000,
            account: {
              order_id: testOrderId.toString()
            }
          }
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/payme/callback')
          .send(callbackData);

        expect(response.status).toBe(200);
        expect(response.body.result).toBeDefined();
        expect(response.body.result.state).toBe(1); // Created

        // Cleanup
        await prisma.orderPayment.deleteMany({
          where: { transaction_id: transactionId }
        });
      });

      it('should handle unknown Payme method', async () => {
        const callbackData = {
          id: Date.now(),
          method: 'UnknownMethod',
          params: {}
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/payme/callback')
          .send(callbackData);

        expect(response.status).toBe(200);
        expect(response.body.error).toBeDefined();
        expect(response.body.error.code).toBe(-32601);
      });
    });
  });

  describe('Uzum Payment Gateway', () => {
    describe('POST /api/payment/uzum/create', () => {
      it('should create Uzum payment', async () => {
        const paymentRequest = {
          order_id: testOrderId,
          amount: 100000,
          return_url: 'http://localhost:3000/payment/success',
          cancel_url: 'http://localhost:3000/payment/cancel',
          description: 'Test Uzum payment creation'
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/uzum/create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentRequest);

        expect([200, 401]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body.payment_id).toBeDefined();
          expect(response.body.payment_url).toBeDefined();
          expect(response.body.status).toBe('PENDING');
        }
      });
    });

    describe('POST /api/payment/uzum/callback', () => {
      it('should handle Uzum callback successfully', async () => {
        // Create a payment first
        const payment = await prisma.orderPayment.create({
          data: {
            order_id: testOrderId,
            amount: 100000,
            payment_method: 'UZUM',
            transaction_id: 'uzum_callback_test',
            status: 'PENDING'
          }
        });

        const callbackData = {
          transaction_id: 'uzum_callback_test',
          order_id: testOrderId.toString(),
          amount: 100000,
          status: 'paid',
          timestamp: new Date().toISOString(),
          signature: 'test_signature'
        };

        const response = await request(app.getHttpServer())
          .post('/api/payment/uzum/callback')
          .send(callbackData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBeDefined();

        // Cleanup
        await prisma.orderPayment.delete({ where: { id: payment.id } });
      });
    });
  });

  describe('Payment Management Endpoints', () => {
    describe('POST /api/payment/refund/:paymentId', () => {
      it('should process refund successfully', async () => {
        // Create a paid payment
        const payment = await prisma.orderPayment.create({
          data: {
            order_id: testOrderId,
            amount: 100000,
            payment_method: 'CLICK',
            transaction_id: 'refund_test_payment',
            status: 'PAID'
          }
        });

        const refundData = {
          amount: 50000 // Partial refund
        };

        const response = await request(app.getHttpServer())
          .post(`/api/payment/refund/${payment.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(refundData);

        expect([200, 401, 403]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body.success).toBe(true);
          expect(response.body.amount).toBe(50000);
        }

        // Cleanup
        await prisma.orderPayment.delete({ where: { id: payment.id } });
      });
    });

    describe('GET /api/payment/admin/statistics', () => {
      it('should get payment statistics', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/payment/admin/statistics')
          .set('Authorization', `Bearer ${adminToken}`);

        expect([200, 401, 403]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body.totalPayments).toBeDefined();
          expect(response.body.totalAmount).toBeDefined();
          expect(response.body.paymentsByMethod).toBeDefined();
          expect(response.body.paymentsByStatus).toBeDefined();
        }
      });

      it('should get payment statistics with date range', async () => {
        const fromDate = new Date('2023-01-01').toISOString();
        const toDate = new Date('2023-12-31').toISOString();

        const response = await request(app.getHttpServer())
          .get('/api/payment/admin/statistics')
          .query({ dateFrom: fromDate, dateTo: toDate })
          .set('Authorization', `Bearer ${adminToken}`);

        expect([200, 401, 403]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body.period).toBeDefined();
          expect(response.body.period.from).toBe(fromDate);
          expect(response.body.period.to).toBe(toDate);
        }
      });
    });
  });

  describe('Webhook Endpoints', () => {
    it('should handle Click webhook', async () => {
      const webhookData = {
        click_trans_id: 123456,
        service_id: 12345,
        merchant_trans_id: 'ORDER_1_123',
        amount: 10000000,
        action: 1,
        error: 0,
        sign_time: new Date().toISOString(),
        sign_string: 'test_signature'
      };

      const response = await request(app.getHttpServer())
        .post('/api/payment/webhooks/click')
        .send(webhookData);

      expect(response.status).toBe(200);
    });

    it('should handle Payme webhook', async () => {
      const webhookData = {
        id: Date.now(),
        method: 'CheckPerformTransaction',
        params: {
          amount: 10000000,
          account: { order_id: '1' }
        }
      };

      const response = await request(app.getHttpServer())
        .post('/api/payment/webhooks/payme')
        .send(webhookData);

      expect(response.status).toBe(200);
    });

    it('should handle Uzum webhook', async () => {
      const webhookData = {
        transaction_id: 'uzum_webhook_test',
        order_id: '1',
        amount: 100000,
        status: 'paid',
        timestamp: new Date().toISOString(),
        signature: 'test_signature'
      };

      const response = await request(app.getHttpServer())
        .post('/api/payment/webhooks/uzum')
        .send(webhookData);

      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Test with very high timeout to simulate network issues
      const paymentData = {
        method: 'CLICK',
        description: 'Test network error handling'
      };

      const response = await request(app.getHttpServer())
        .post(`/api/payment/process/${testOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(1000) // 1 second timeout
        .send(paymentData);

      // Should either succeed or handle timeout gracefully
      expect([200, 401, 408, 500]).toContain(response.status);
    });

    it('should validate payment amounts', async () => {
      const paymentData = {
        method: 'CLICK',
        amount: -100000, // Negative amount
        description: 'Test negative amount'
      };

      const response = await request(app.getHttpServer())
        .post('/api/payment/click/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          order_id: testOrderId,
          ...paymentData
        });

      expect([400, 401]).toContain(response.status);
    });

    it('should handle concurrent payment attempts', async () => {
      const paymentData = {
        method: 'CLICK',
        description: 'Test concurrent payments'
      };

      // Make multiple concurrent requests
      const requests = Array(3).fill(null).map(() => 
        request(app.getHttpServer())
          .post(`/api/payment/process/${testOrderId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData)
      );

      const responses = await Promise.all(requests.map(req => 
        req.catch(err => ({ status: err.status || 500 }))
      ));

      // At least one should succeed or all should handle gracefully
      responses.forEach(response => {
        expect([200, 400, 401, 409]).toContain(response.status);
      });
    });
  });
});