import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../../src/payment/payment.service';
import { ClickService } from '../../../src/payment/services/click.service';
import { PaymeService } from '../../../src/payment/services/payme.service';
import { UzumService } from '../../../src/payment/services/uzum.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Enhanced Payment Services Tests', () => {
  let paymentService: PaymentService;
  let clickService: ClickService;
  let paymeService: PaymeService;
  let uzumService: UzumService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    orderPayment: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'CLICK_MERCHANT_ID': 'test_click_merchant',
        'CLICK_SECRET_KEY': 'test_click_secret',
        'CLICK_SERVICE_ID': '12345',
        'CLICK_MERCHANT_USER_ID': 'test_user',
        'CLICK_BASE_URL': 'https://api.click.uz/v2',
        'PAYME_MERCHANT_ID': 'test_payme_merchant',
        'PAYME_SECRET_KEY': 'test_payme_secret',
        'PAYME_BASE_URL': 'https://checkout.paycom.uz',
        'UZUM_MERCHANT_ID': 'test_uzum_merchant',
        'UZUM_SECRET_KEY': 'test_uzum_secret',
        'UZUM_API_KEY': 'test_uzum_api',
        'UZUM_BASE_URL': 'https://api.uzum.uz/v1',
        'UZUM_WEBHOOK_URL': 'https://api.yourapp.com/api/payment/uzum/callback',
        'FRONTEND_URL': 'http://localhost:3000',
        'NODE_ENV': 'test',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        ClickService,
        PaymeService,
        UzumService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    paymentService = module.get<PaymentService>(PaymentService);
    clickService = module.get<ClickService>(ClickService);
    paymeService = module.get<PaymeService>(PaymeService);
    uzumService = module.get<UzumService>(UzumService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PaymentService', () => {
    describe('processPayment', () => {
      const mockOrder = {
        id: 1,
        user: { id: 1, email: 'test@example.com' },
        final_amount: 100000,
        order_number: 'ORD001',
        payment_status: 'PENDING',
        items: []
      };

      beforeEach(() => {
        mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
        mockPrismaService.orderPayment.create.mockResolvedValue({
          id: 1,
          order_id: 1,
          amount: 100000,
          payment_method: 'CLICK',
          transaction_id: 'click_123',
          status: 'PENDING'
        });
        mockPrismaService.order.update.mockResolvedValue(mockOrder);
      });

      it('should process Click payment successfully', async () => {
        const paymentData = {
          method: 'CLICK' as const,
          returnUrl: 'http://localhost:3000/success',
          description: 'Test payment'
        };

        const result = await paymentService.processPayment(1, paymentData);

        expect(result.status).toBe('PENDING');
        expect(result.paymentUrl).toBeDefined();
        expect(mockPrismaService.orderPayment.create).toHaveBeenCalled();
      });

      it('should process Payme payment successfully', async () => {
        const paymentData = {
          method: 'PAYME' as const,
          returnUrl: 'http://localhost:3000/success',
          description: 'Test payment'
        };

        const result = await paymentService.processPayment(1, paymentData);

        expect(result.status).toBe('PENDING');
        expect(result.paymentUrl).toBeDefined();
        expect(mockPrismaService.orderPayment.create).toHaveBeenCalled();
      });

      it('should process Uzum payment successfully', async () => {
        const paymentData = {
          method: 'UZUM' as const,
          returnUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel',
          description: 'Test payment'
        };

        const result = await paymentService.processPayment(1, paymentData);

        expect(result.status).toBe('PENDING');
        expect(result.paymentUrl).toBeDefined();
        expect(mockPrismaService.orderPayment.create).toHaveBeenCalled();
      });

      it('should process card payment successfully', async () => {
        const paymentData = {
          method: 'CARD' as const,
          cardDetails: {
            cardNumber: '4111111111111111',
            expiryMonth: '12',
            expiryYear: '2025',
            cvv: '123',
            cardHolderName: 'John Doe'
          }
        };

        const result = await paymentService.processPayment(1, paymentData);

        expect(['PAID', 'FAILED']).toContain(result.status);
        expect(mockPrismaService.orderPayment.create).toHaveBeenCalled();
      });

      it('should throw error for non-existent order', async () => {
        mockPrismaService.order.findUnique.mockResolvedValue(null);

        const paymentData = {
          method: 'CLICK' as const
        };

        await expect(paymentService.processPayment(999, paymentData))
          .rejects.toThrow(NotFoundException);
      });

      it('should throw error for already paid order', async () => {
        mockPrismaService.order.findUnique.mockResolvedValue({
          ...mockOrder,
          payment_status: 'PAID'
        });

        const paymentData = {
          method: 'CLICK' as const
        };

        await expect(paymentService.processPayment(1, paymentData))
          .rejects.toThrow(BadRequestException);
      });

      it('should handle card payment without card details', async () => {
        const paymentData = {
          method: 'CARD' as const
        };

        await expect(paymentService.processPayment(1, paymentData))
          .rejects.toThrow(BadRequestException);
      });
    });

    describe('refundPayment', () => {
      const mockPayment = {
        id: 1,
        order_id: 1,
        amount: 100000,
        payment_method: 'CLICK',
        transaction_id: 'click_123',
        status: 'PAID',
        order: { id: 1 }
      };

      beforeEach(() => {
        mockPrismaService.orderPayment.findUnique.mockResolvedValue(mockPayment);
        mockPrismaService.orderPayment.update.mockResolvedValue(mockPayment);
        mockPrismaService.order.update.mockResolvedValue({ id: 1 });
      });

      it('should process full refund successfully', async () => {
        const result = await paymentService.refundPayment(1);

        expect(result.success).toBe(true);
        expect(result.amount).toBe(100000);
        expect(mockPrismaService.orderPayment.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: { status: 'REFUNDED' }
        });
      });

      it('should process partial refund successfully', async () => {
        const result = await paymentService.refundPayment(1, 50000);

        expect(result.success).toBe(true);
        expect(result.amount).toBe(50000);
        expect(mockPrismaService.orderPayment.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: { status: 'PARTIALLY_REFUNDED' }
        });
      });

      it('should throw error for non-existent payment', async () => {
        mockPrismaService.orderPayment.findUnique.mockResolvedValue(null);

        await expect(paymentService.refundPayment(999))
          .rejects.toThrow(NotFoundException);
      });

      it('should throw error for unpaid payment', async () => {
        mockPrismaService.orderPayment.findUnique.mockResolvedValue({
          ...mockPayment,
          status: 'PENDING'
        });

        await expect(paymentService.refundPayment(1))
          .rejects.toThrow(BadRequestException);
      });

      it('should throw error for refund amount exceeding payment amount', async () => {
        await expect(paymentService.refundPayment(1, 200000))
          .rejects.toThrow(BadRequestException);
      });
    });

    describe('getPaymentStatistics', () => {
      beforeEach(() => {
        mockPrismaService.orderPayment.count.mockResolvedValue(10);
        mockPrismaService.orderPayment.aggregate.mockResolvedValue({
          _sum: { amount: 1000000 }
        });
        mockPrismaService.orderPayment.groupBy.mockResolvedValue([
          { payment_method: 'CLICK', _count: { payment_method: 5 }, _sum: { amount: 500000 } },
          { payment_method: 'PAYME', _count: { payment_method: 5 }, _sum: { amount: 500000 } }
        ]);
      });

      it('should return payment statistics successfully', async () => {
        const result = await paymentService.getPaymentStatistics();

        expect(result.totalPayments).toBe(10);
        expect(result.totalAmount).toBe(1000000);
        expect(result.paymentsByMethod).toHaveLength(2);
        expect(result.paymentsByStatus).toHaveLength(2);
      });

      it('should return statistics for date range', async () => {
        const fromDate = new Date('2023-01-01');
        const toDate = new Date('2023-12-31');
        
        const result = await paymentService.getPaymentStatistics(fromDate, toDate);

        expect(result.period.from).toBe(fromDate);
        expect(result.period.to).toBe(toDate);
        expect(mockPrismaService.orderPayment.count).toHaveBeenCalledWith({
          where: {
            createdAt: {
              gte: fromDate,
              lte: toDate
            }
          }
        });
      });
    });
  });

  describe('ClickService', () => {
    const mockOrder = {
      id: 1,
      user: { id: 1, email: 'test@example.com' },
      final_amount: 100000,
      order_number: 'ORD001',
      payment_status: 'PENDING'
    };

    describe('createPayment', () => {
      beforeEach(() => {
        mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
        mockPrismaService.orderPayment.create.mockResolvedValue({
          id: 1,
          order_id: 1,
          amount: 100000,
          payment_method: 'CLICK',
          transaction_id: 'click_123',
          status: 'PENDING'
        });
      });

      it('should create Click payment successfully', async () => {
        const request = {
          order_id: 1,
          amount: 100000,
          return_url: 'http://localhost:3000/success',
          description: 'Test payment'
        };

        const result = await clickService.createPayment(request);

        expect(result.payment_id).toContain('click_');
        expect(result.payment_url).toContain('click.uz');
        expect(result.status).toBe('PENDING');
        expect(mockPrismaService.orderPayment.create).toHaveBeenCalled();
      });

      it('should throw error for invalid amount', async () => {
        const request = {
          order_id: 1,
          amount: -100,
          return_url: 'http://localhost:3000/success'
        };

        await expect(clickService.createPayment(request))
          .rejects.toThrow(BadRequestException);
      });

      it('should throw error for non-existent order', async () => {
        mockPrismaService.order.findUnique.mockResolvedValue(null);

        const request = {
          order_id: 999,
          amount: 100000
        };

        await expect(clickService.createPayment(request))
          .rejects.toThrow(BadRequestException);
      });

      it('should throw error for already paid order', async () => {
        mockPrismaService.order.findUnique.mockResolvedValue({
          ...mockOrder,
          payment_status: 'PAID'
        });

        const request = {
          order_id: 1,
          amount: 100000
        };

        await expect(clickService.createPayment(request))
          .rejects.toThrow(BadRequestException);
      });
    });

    describe('handleCallback', () => {
      const mockPayment = {
        id: 1,
        order_id: 1,
        amount: 100000,
        payment_method: 'CLICK',
        transaction_id: 'click_123',
        status: 'PENDING',
        gateway_response: {},
        order: mockOrder
      };

      beforeEach(() => {
        mockPrismaService.orderPayment.findFirst.mockResolvedValue(mockPayment);
        mockPrismaService.orderPayment.update.mockResolvedValue(mockPayment);
        mockPrismaService.order.update.mockResolvedValue(mockOrder);
      });

      it('should handle successful callback', async () => {
        const callbackData = {
          click_trans_id: 123456,
          service_id: 12345,
          click_paydoc_id: 789,
          merchant_trans_id: 'ORDER_1_123456789',
          amount: 10000000, // in tiyin
          action: 1,
          error: 0,
          error_note: '',
          sign_time: new Date().toISOString(),
          sign_string: 'valid_signature'
        };

        // Mock signature verification
        jest.spyOn(clickService as any, 'verifyCallbackSignature').mockReturnValue(true);

        const result = await clickService.handleCallback(callbackData);

        expect(result.error).toBe(0);
        expect(result.error_note).toBe('OK');
      });

      it('should handle callback with invalid signature', async () => {
        const callbackData = {
          click_trans_id: 123456,
          service_id: 12345,
          click_paydoc_id: 789,
          merchant_trans_id: 'ORDER_1_123456789',
          amount: 10000000,
          action: 1,
          error: 0,
          error_note: '',
          sign_time: new Date().toISOString(),
          sign_string: 'invalid_signature'
        };

        // Mock signature verification
        jest.spyOn(clickService as any, 'verifyCallbackSignature').mockReturnValue(false);

        const result = await clickService.handleCallback(callbackData);

        expect(result.error).toBe(-1);
        expect(result.error_note).toBe('Invalid signature');
      });

      it('should handle callback with payment error', async () => {
        const callbackData = {
          click_trans_id: 123456,
          service_id: 12345,
          click_paydoc_id: 789,
          merchant_trans_id: 'ORDER_1_123456789',
          amount: 10000000,
          action: 1,
          error: -5,
          error_note: 'Insufficient funds',
          sign_time: new Date().toISOString(),
          sign_string: 'valid_signature'
        };

        // Mock signature verification
        jest.spyOn(clickService as any, 'verifyCallbackSignature').mockReturnValue(true);

        const result = await clickService.handleCallback(callbackData);

        expect(result.error).toBe(-5);
        expect(result.error_note).toBe('Insufficient funds');
      });
    });
  });

  describe('PaymeService', () => {
    const mockOrder = {
      id: 1,
      user: { id: 1, email: 'test@example.com' },
      final_amount: 100000,
      order_number: 'ORD001',
      payment_status: 'PENDING'
    };

    describe('createPayment', () => {
      beforeEach(() => {
        mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
        mockPrismaService.orderPayment.create.mockResolvedValue({
          id: 1,
          order_id: 1,
          amount: 100000,
          payment_method: 'PAYME',
          transaction_id: 'payme_123',
          status: 'PENDING'
        });
      });

      it('should create Payme payment successfully', async () => {
        const request = {
          order_id: 1,
          amount: 100000,
          return_url: 'http://localhost:3000/success',
          description: 'Test payment'
        };

        const result = await paymeService.createPayment(request);

        expect(result.payment_id).toContain('payme_');
        expect(result.payment_url).toContain('paycom.uz');
        expect(result.status).toBe('PENDING');
        expect(mockPrismaService.orderPayment.create).toHaveBeenCalled();
      });

      it('should throw error for invalid amount', async () => {
        const request = {
          order_id: 1,
          amount: -100,
          return_url: 'http://localhost:3000/success'
        };

        await expect(paymeService.createPayment(request))
          .rejects.toThrow(BadRequestException);
      });
    });

    describe('handleCallback', () => {
      it('should handle CheckPerformTransaction', async () => {
        mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

        const callbackData = {
          id: 123,
          method: 'CheckPerformTransaction',
          params: {
            amount: 10000000, // in tiyin
            account: { order_id: '1' }
          }
        };

        const result = await paymeService.handleCallback(callbackData);

        expect(result.result.allow).toBe(true);
      });

      it('should handle CreateTransaction', async () => {
        mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
        mockPrismaService.orderPayment.findFirst.mockResolvedValue(null);
        mockPrismaService.orderPayment.create.mockResolvedValue({
          id: 1,
          order_id: 1,
          amount: 100000,
          payment_method: 'PAYME',
          transaction_id: 'payme_trans_123',
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        const callbackData = {
          id: 123,
          method: 'CreateTransaction',
          params: {
            id: 'payme_trans_123',
            time: Date.now(),
            amount: 10000000,
            account: { order_id: '1' }
          }
        };

        const result = await paymeService.handleCallback(callbackData);

        expect(result.result.transaction).toBe('1');
        expect(result.result.state).toBe(1);
      });

      it('should handle unknown method', async () => {
        const callbackData = {
          id: 123,
          method: 'UnknownMethod',
          params: {}
        };

        const result = await paymeService.handleCallback(callbackData);

        expect(result.error.code).toBe(-32601);
        expect(result.error.message).toBe('Method UnknownMethod not found');
      });
    });
  });

  describe('UzumService', () => {
    const mockOrder = {
      id: 1,
      user: { id: 1, email: 'test@example.com', phone: '+998901234567', first_name: 'John', last_name: 'Doe' },
      final_amount: 100000,
      order_number: 'ORD001',
      payment_status: 'PENDING'
    };

    describe('createPayment', () => {
      beforeEach(() => {
        mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
        mockPrismaService.orderPayment.create.mockResolvedValue({
          id: 1,
          order_id: 1,
          amount: 100000,
          payment_method: 'UZUM',
          transaction_id: 'uzum_123',
          status: 'PENDING'
        });
      });

      it('should create Uzum payment successfully', async () => {
        const request = {
          order_id: 1,
          amount: 100000,
          return_url: 'http://localhost:3000/success',
          cancel_url: 'http://localhost:3000/cancel',
          description: 'Test payment'
        };

        const result = await uzumService.createPayment(request);

        expect(result.payment_id).toContain('uzum_');
        expect(result.payment_url).toBeDefined();
        expect(result.status).toBe('PENDING');
        expect(mockPrismaService.orderPayment.create).toHaveBeenCalled();
      });

      it('should throw error for invalid amount', async () => {
        const request = {
          order_id: 1,
          amount: -100,
          return_url: 'http://localhost:3000/success'
        };

        await expect(uzumService.createPayment(request))
          .rejects.toThrow(BadRequestException);
      });
    });

    describe('handleCallback', () => {
      const mockPayment = {
        id: 1,
        order_id: 1,
        amount: 100000,
        payment_method: 'UZUM',
        transaction_id: 'uzum_123',
        status: 'PENDING'
      };

      beforeEach(() => {
        mockPrismaService.orderPayment.findFirst.mockResolvedValue(mockPayment);
        mockPrismaService.orderPayment.update.mockResolvedValue(mockPayment);
        mockPrismaService.order.update.mockResolvedValue(mockOrder);
      });

      it('should handle successful callback', async () => {
        const callbackData = {
          transaction_id: 'uzum_123',
          order_id: '1',
          amount: 100000,
          status: 'paid',
          timestamp: new Date().toISOString(),
          signature: 'valid_signature',
          error_code: 0
        };

        // Mock signature verification
        jest.spyOn(uzumService as any, 'verifySignature').mockReturnValue(true);

        const result = await uzumService.handleCallback(callbackData);

        expect(result.success).toBe(true);
        expect(result.transaction_id).toBe('uzum_123');
      });

      it('should handle callback with error', async () => {
        const callbackData = {
          transaction_id: 'uzum_123',
          order_id: '1',
          amount: 100000,
          status: 'failed',
          timestamp: new Date().toISOString(),
          signature: 'valid_signature',
          error_code: -1,
          error_message: 'Payment failed'
        };

        // Mock signature verification
        jest.spyOn(uzumService as any, 'verifySignature').mockReturnValue(true);

        const result = await uzumService.handleCallback(callbackData);

        expect(result.success).toBe(false);
        expect(result.error_code).toBe(-1);
        expect(result.message).toBe('Payment failed');
      });

      it('should handle callback with invalid signature', async () => {
        const callbackData = {
          transaction_id: 'uzum_123',
          order_id: '1',
          amount: 100000,
          status: 'paid',
          timestamp: new Date().toISOString(),
          signature: 'invalid_signature'
        };

        // Mock signature verification
        jest.spyOn(uzumService as any, 'verifySignature').mockReturnValue(false);

        const result = await uzumService.handleCallback(callbackData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Callback processing failed');
      });
    });
  });
});