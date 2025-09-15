import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';
import axios from 'axios';

export interface PaymePaymentRequest {
  order_id: number;
  amount: number;
  return_url?: string;
  description?: string;
}

export interface PaymePaymentResponse {
  payment_url: string;
  payment_id: string;
  status: string;
}

export interface PaymeCallbackData {
  id: number;
  method: string;
  params: any;
}

export interface PaymeTransactionParams {
  id?: string;
  time?: number;
  amount?: number;
  account?: {
    order_id: string;
  };
  reason?: number;
}

@Injectable()
export class PaymeService {
  private readonly logger = new Logger(PaymeService.name);
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly testMode: boolean;

  // Payme error codes
  private readonly PAYME_ERRORS = {
    TRANSPORT_ERROR: -32300,
    ACCESS_DENIED: -32504,
    METHOD_NOT_FOUND: -32601,
    INVALID_AMOUNT: -31001,
    ORDER_NOT_FOUND: -31050,
    TRANSACTION_NOT_FOUND: -31003,
    INVALID_ACCOUNT: -31008,
    CANNOT_PERFORM: -31008,
    CANNOT_CANCEL: -31007
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.merchantId = this.configService.get<string>('PAYME_MERCHANT_ID') || 'test_merchant';
    this.secretKey = this.configService.get<string>('PAYME_SECRET_KEY') || 'test_secret';
    this.baseUrl = this.configService.get<string>('PAYME_BASE_URL') || 'https://checkout.paycom.uz';
    this.testMode = this.configService.get<string>('NODE_ENV') !== 'production';
  }

  async createPayment(request: PaymePaymentRequest): Promise<PaymePaymentResponse> {
    try {
      const { order_id, amount, return_url, description } = request;

      // Validate input
      if (amount <= 0) {
        throw new BadRequestException('Amount must be greater than 0');
      }

      // Validate order
      const order = await this.prisma.order.findUnique({
        where: { id: order_id },
        include: { user: true }
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      if (order.payment_status === 'PAID') {
        throw new BadRequestException('Order already paid');
      }

      // Generate unique payment ID
      const paymentId = `payme_${Date.now()}_${order_id}`;

      // Prepare Payme payment data
      const paymentData = {
        merchant: this.merchantId,
        amount: amount * 100, // Payme works with tiyin (UZS * 100)
        account: {
          order_id: order_id.toString(),
        },
        description: description || `Buyurtma #${order.order_number} uchun to'lov`,
        return_url: return_url || `${this.configService.get('FRONTEND_URL')}/payment/success`,
        cancel_url: `${this.configService.get('FRONTEND_URL')}/payment/cancel`,
      };

      // Create Base64 encoded URL
      const encodedData = Buffer.from(JSON.stringify(paymentData)).toString('base64');
      const paymentUrl = `${this.baseUrl}/${encodedData}`;

      // Save payment record
      await this.prisma.orderPayment.create({
        data: {
          order_id: order_id,
          amount: amount,
          payment_method: 'PAYME',
          transaction_id: paymentId,
          status: 'PENDING',
          gateway_response: {
            ...paymentData,
            encoded_data: encodedData,
            payment_url: paymentUrl
          },
        },
      });

      this.logger.log(`Payme payment created: ${paymentId} for order ${order_id}`);

      return {
        payment_url: paymentUrl,
        payment_id: paymentId,
        status: 'PENDING',
      };
    } catch (error) {
      this.logger.error('Error creating Payme payment:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create Payme payment');
    }
  }

  async verifyPayment(paymentId: string, status: string): Promise<boolean> {
    try {
      const payment = await this.prisma.orderPayment.findFirst({
        where: { transaction_id: paymentId },
        include: { order: true }
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      const newStatus = this.mapPaymeStatus(status);

      // Update payment status
      await this.prisma.orderPayment.update({
        where: { id: payment.id },
        data: { status: newStatus as PaymentStatus },
      });

      // Update order status
      if (newStatus === 'PAID') {
        await this.prisma.order.update({
          where: { id: payment.order_id },
          data: {
            payment_status: 'PAID',
            status: 'CONFIRMED'
          },
        });
      } else if (newStatus === 'FAILED' || newStatus === 'CANCELLED') {
        await this.prisma.order.update({
          where: { id: payment.order_id },
          data: {
            payment_status: 'FAILED'
          },
        });
      }

      this.logger.log(`Payme payment verified: ${paymentId} - ${newStatus}`);
      return newStatus === 'PAID';
    } catch (error) {
      this.logger.error('Error verifying Payme payment:', error);
      throw error;
    }
  }

  async handleCallback(callbackData: PaymeCallbackData): Promise<any> {
    try {
      this.logger.log('Payme callback received:', JSON.stringify(callbackData));

      const { id, method, params } = callbackData;
      
      // Validate required fields
      if (!method || !params) {
        return this.createErrorResponse(this.PAYME_ERRORS.TRANSPORT_ERROR, 'Invalid request format');
      }

      // Handle different Payme methods
      switch (method) {
        case 'CheckPerformTransaction':
          return await this.checkPerformTransaction(params);
        case 'CreateTransaction':
          return await this.createTransaction(params);
        case 'PerformTransaction':
          return await this.performTransaction(params);
        case 'CancelTransaction':
          return await this.cancelTransaction(params);
        case 'CheckTransaction':
          return await this.checkTransaction(params);
        case 'GetStatement':
          return await this.getStatement(params);
        default:
          return this.createErrorResponse(this.PAYME_ERRORS.METHOD_NOT_FOUND, 'Method not found');
      }
    } catch (error) {
      this.logger.error('Error handling Payme callback:', error);
      return this.createErrorResponse(this.PAYME_ERRORS.TRANSPORT_ERROR, 'Internal server error');
    }
  }

  private async checkPerformTransaction(params: PaymeTransactionParams): Promise<any> {
    try {
      const { account, amount } = params;
      
      if (!account || !account.order_id) {
        return this.createErrorResponse(this.PAYME_ERRORS.INVALID_ACCOUNT, 'Invalid account parameters');
      }

      if (!amount || amount <= 0) {
        return this.createErrorResponse(this.PAYME_ERRORS.INVALID_AMOUNT, 'Invalid amount');
      }

      const orderId = parseInt(account.order_id, 10);
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { payments: true }
      });

      if (!order) {
        return this.createErrorResponse(this.PAYME_ERRORS.ORDER_NOT_FOUND, 'Order not found');
      }

      // Check if order is already paid
      const paidPayment = order.payments.find(p => p.status === 'PAID');
      if (paidPayment) {
        return this.createErrorResponse(this.PAYME_ERRORS.CANNOT_PERFORM, 'Order already paid');
      }

      // Check if amount matches
      if (amount !== Number(order.total_amount) * 100) { // Convert to tiyin for comparison
        return this.createErrorResponse(this.PAYME_ERRORS.INVALID_AMOUNT, 'Invalid amount');
      }

      return {
        result: {
          allow: true,
          detail: {
            receipt_type: 0,
            items: [
              {
                title: `Order #${order.order_number}`,
                price: Number(order.total_amount) * 100,
                count: 1,
                code: 'order',
                package_code: 'order',
                vat_percent: 0
              }
            ]
          }
        }
      };
    } catch (error) {
      this.logger.error('CheckPerformTransaction error:', error);
      return this.createErrorResponse(this.PAYME_ERRORS.TRANSPORT_ERROR, 'Transaction check failed');
    }
  }

  private async createTransaction(params: PaymeTransactionParams): Promise<any> {
    try {
      const { id, time, amount, account } = params;

      if (!id || !time || !amount || !account || !account.order_id) {
        return this.createErrorResponse(this.PAYME_ERRORS.TRANSPORT_ERROR, 'Invalid parameters');
      }

      // Check if transaction already exists
      let payment = await this.prisma.orderPayment.findFirst({
        where: { transaction_id: id },
        include: { order: true }
      });

      if (payment) {
        // Transaction already exists, return current state
        const state = this.getPaymeTransactionState(payment.status);
        return {
          result: {
            transaction: payment.id.toString(),
            state,
            create_time: payment.createdAt.getTime(),
            perform_time: state === 2 ? payment.updatedAt.getTime() : 0,
            cancel_time: 0,
            reason: null
          }
        };
      }

      // Create new transaction
      const orderId = parseInt(account.order_id, 10);
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { payments: true }
      });

      if (!order) {
        return this.createErrorResponse(this.PAYME_ERRORS.ORDER_NOT_FOUND, 'Order not found');
      }

      // Check if order is already paid
      const paidPayment = order.payments.find(p => p.status === 'PAID');
      if (paidPayment) {
        return this.createErrorResponse(this.PAYME_ERRORS.CANNOT_PERFORM, 'Order already paid');
      }

      // Create payment record
      payment = await this.prisma.orderPayment.create({
        data: {
          order_id: orderId,
          amount: amount / 100, // Convert from tiyin to UZS
          payment_method: 'PAYME',
          transaction_id: id,
          status: 'PENDING',
          gateway_response: {
            payme_transaction_id: id,
            time,
            amount,
            account,
            state: 1, // Created
          },
        },
        include: { order: true }
      });

      return {
        result: {
          transaction: payment.id.toString(),
          state: 1, // Created
          create_time: time,
          perform_time: 0,
          cancel_time: 0,
          reason: null
        }
      };
    } catch (error) {
      this.logger.error('CreateTransaction error:', error);
      return this.createErrorResponse(this.PAYME_ERRORS.TRANSPORT_ERROR, 'Transaction creation failed');
    }
  }

  private async performTransaction(params: PaymeTransactionParams): Promise<any> {
    try {
      const { id } = params;

      if (!id) {
        return this.createErrorResponse(this.PAYME_ERRORS.TRANSACTION_NOT_FOUND, 'Transaction ID required');
      }

      const payment = await this.prisma.orderPayment.findFirst({
        where: { transaction_id: id },
        include: { order: true }
      });

      if (!payment) {
        return this.createErrorResponse(this.PAYME_ERRORS.TRANSACTION_NOT_FOUND, 'Transaction not found');
      }

      // Check if already performed
      if (payment.status === 'PAID') {
        return {
          result: {
            transaction: payment.id.toString(),
            state: 2, // Performed
            perform_time: payment.updatedAt.getTime(),
            cancel_time: 0
          }
        };
      }

      // Update payment status to PAID
      const updatedPayment = await this.prisma.orderPayment.update({
        where: { id: payment.id },
        data: { 
          status: 'PAID',
          gateway_response: {
            ...(payment.gateway_response as object || {}),
            perform_time: Date.now(),
            state: 2 // Performed
          }
        },
        include: { order: true }
      });

      // Update order status
      if (updatedPayment.order) {
        await this.prisma.order.update({
          where: { id: updatedPayment.order_id },
          data: { 
            payment_status: 'PAID',
            status: 'CONFIRMED',
            paid_at: new Date()
          },
        });
      }

      return {
        result: {
          transaction: updatedPayment.id.toString(),
          state: 2, // Performed
          perform_time: Date.now(),
          cancel_time: 0
        }
      };
    } catch (error) {
      this.logger.error('PerformTransaction error:', error);
      return this.createErrorResponse(this.PAYME_ERRORS.TRANSPORT_ERROR, 'Transaction perform failed');
    }
  }

  private async cancelTransaction(params: PaymeTransactionParams): Promise<any> {
    try {
      const { id, reason } = params;
      
      if (!id) {
        return this.createErrorResponse(this.PAYME_ERRORS.TRANSACTION_NOT_FOUND, 'Transaction ID required');
      }

      const payment = await this.prisma.orderPayment.findFirst({
        where: { transaction_id: id },
        include: { order: true }
      });

      if (!payment) {
        return this.createErrorResponse(this.PAYME_ERRORS.TRANSACTION_NOT_FOUND, 'Transaction not found');
      }

      // Check if already cancelled
      if (payment.status === 'CANCELLED') {
        return {
          result: {
            transaction: payment.id.toString(),
            state: -1, // Cancelled
            cancel_time: payment.updatedAt.getTime(),
            reason: (payment.gateway_response as any)?.reason || null
          }
        };
      }

      // Update payment status to CANCELLED
      const updatedPayment = await this.prisma.orderPayment.update({
        where: { id: payment.id },
        data: { 
          status: 'CANCELLED',
          gateway_response: {
            ...(payment.gateway_response as object || {}),
            cancel_time: Date.now(),
            reason: reason || 'Cancelled by user',
            state: -1 // Cancelled
          }
        }
      });

      // Update order status if needed
      await this.prisma.order.update({
        where: { id: payment.order_id },
        data: { 
          payment_status: 'CANCELLED',
          status: 'CANCELLED'
        },
      });

      return {
        result: {
          transaction: updatedPayment.id.toString(),
          state: -1, // Cancelled
          cancel_time: Date.now(),
          reason: reason || 'Cancelled by user'
        }
      };
    } catch (error) {
      this.logger.error('CancelTransaction error:', error);
      return this.createErrorResponse(this.PAYME_ERRORS.TRANSPORT_ERROR, 'Transaction cancel failed');
    }
  }

  private async checkTransaction(params: PaymeTransactionParams): Promise<any> {
    try {
      const { id } = params;

      if (!id) {
        return this.createErrorResponse(this.PAYME_ERRORS.TRANSACTION_NOT_FOUND, 'Transaction ID required');
      }

      const payment = await this.prisma.orderPayment.findFirst({
        where: { transaction_id: id },
        include: { order: true }
      });

      if (!payment) {
        return this.createErrorResponse(this.PAYME_ERRORS.TRANSACTION_NOT_FOUND, 'Transaction not found');
      }

      const gatewayResponse = payment.gateway_response as any;
      const state = this.getPaymeTransactionState(payment.status);
      
      return {
        result: {
          transaction: payment.id.toString(),
          state,
          create_time: payment.createdAt.getTime(),
          perform_time: state === 2 ? payment.updatedAt.getTime() : 0,
          cancel_time: state === -1 ? payment.updatedAt.getTime() : 0,
          reason: gatewayResponse?.reason || null
        }
      };
    } catch (error) {
      this.logger.error('CheckTransaction error:', error);
      return this.createErrorResponse(this.PAYME_ERRORS.TRANSPORT_ERROR, 'Transaction check failed');
    }
  }

  private async getStatement(params: any): Promise<any> {
    try {
      const { from, to } = params;
      
      if (!from || !to) {
        return this.createErrorResponse(this.PAYME_ERRORS.INVALID_ACCOUNT, 'From and to dates are required');
      }

      const fromDate = new Date(from);
      const toDate = new Date(to);

      const payments = await this.prisma.orderPayment.findMany({
        where: {
          payment_method: 'PAYME',
          createdAt: {
            gte: fromDate,
            lte: toDate
          },
          status: {
            in: ['PAID', 'CANCELLED']
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      const transactions = payments.map(payment => {
        const gatewayResponse = payment.gateway_response as any;
        return {
          id: payment.transaction_id,
          time: payment.createdAt.getTime(),
          amount: Number(payment.amount) * 100, // Convert to tiyin
          account: {
            order_id: payment.order_id.toString()
          },
          create_time: payment.createdAt.getTime(),
          perform_time: payment.status === 'PAID' ? payment.updatedAt.getTime() : 0,
          cancel_time: payment.status === 'CANCELLED' ? payment.updatedAt.getTime() : 0,
          transaction: payment.id.toString(),
          state: this.getPaymeTransactionState(payment.status),
          reason: gatewayResponse?.reason || null
        };
      });

      return {
        result: {
          transactions
        }
      };
    } catch (error) {
      this.logger.error('GetStatement error:', error);
      return this.createErrorResponse(this.PAYME_ERRORS.TRANSPORT_ERROR, 'Statement generation failed');
    }
  }

  private mapPaymeStatus(status: string): 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' {
    switch (status) {
      case '2':
        return 'PAID';
      case '1':
        return 'PENDING';
      case '-1':
      case '-2':
        return 'CANCELLED';
      default:
        return 'FAILED';
    }
  }

  private getPaymeTransactionState(status: string): number {
    switch (status) {
      case 'PAID':
        return 2;
      case 'PENDING':
        return 1;
      case 'CANCELLED':
      case 'FAILED':
        return -1;
      default:
        return 0;
    }
  }

  async checkPaymentStatus(paymentId: string): Promise<any> {
    try {
      const payment = await this.prisma.orderPayment.findFirst({
        where: { transaction_id: paymentId },
        include: { order: true }
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      return {
        payment_id: paymentId,
        status: payment.status,
        amount: payment.amount,
        order_id: payment.order_id,
        created_at: payment.createdAt,
        updated_at: payment.updatedAt
      };
    } catch (error) {
      this.logger.error('Error checking payment status:', error);
      throw error;
    }
  }

  async processRefund(transactionId: string, amount: number): Promise<any> {
    try {
      const payment = await this.prisma.orderPayment.findFirst({
        where: { transaction_id: transactionId },
        include: { order: true }
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      if (payment.status !== 'PAID') {
        throw new BadRequestException('Payment is not in PAID status');
      }

      if (amount > Number(payment.amount)) {
        throw new BadRequestException('Refund amount cannot exceed payment amount');
      }

      // Update payment status to REFUNDED
      const updatedPayment = await this.prisma.orderPayment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          gateway_response: {
            ...(payment.gateway_response as object || {}),
            refund_amount: amount,
            refund_time: Date.now(),
            refund_status: 'COMPLETED'
          }
        }
      });

      // Update order status
      await this.prisma.order.update({
        where: { id: payment.order_id },
        data: {
          payment_status: 'REFUNDED',
          status: 'REFUNDED'
        }
      });

      this.logger.log(`Payme refund processed: ${transactionId} - Amount: ${amount}`);

      return {
        transaction_id: transactionId,
        refund_amount: amount,
        status: 'REFUNDED',
        refund_time: new Date()
      };
    } catch (error) {
      this.logger.error('Error processing refund:', error);
      throw error;
    }
  }

  private createErrorResponse(code: number, message: string, data: any = null): any {
    const response: any = {
      error: {
        code,
        message,
      },
    };
    
    if (data !== null) {
      response.error.data = data;
    }
    
    return response;
  }
}
