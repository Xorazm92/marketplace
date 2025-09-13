import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import axios from 'axios';

export interface ClickPaymentRequest {
  order_id: number;
  amount: number;
  return_url?: string;
  description?: string;
}

export interface ClickPaymentResponse {
  payment_url: string;
  payment_id: string;
  status: string;
}

export interface ClickCallbackData {
  click_trans_id: number;
  service_id: number;
  click_paydoc_id: number;
  merchant_trans_id: string;
  amount: number;
  action: number;
  error: number;
  error_note: string;
  sign_time: string;
  sign_string: string;
}

@Injectable()
export class ClickService {
  private readonly logger = new Logger(ClickService.name);
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly serviceId: string;
  private readonly merchantUserId: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.merchantId = this.configService.get<string>('CLICK_MERCHANT_ID') || 'test_merchant';
    this.secretKey = this.configService.get<string>('CLICK_SECRET_KEY') || 'test_secret';
    this.serviceId = this.configService.get<string>('CLICK_SERVICE_ID') || 'test_service';
    this.merchantUserId = this.configService.get<string>('CLICK_MERCHANT_USER_ID') || 'test_user';
    this.baseUrl = this.configService.get<string>('CLICK_BASE_URL') || 'https://api.click.uz/v2';
  }

  async createPayment(request: ClickPaymentRequest): Promise<ClickPaymentResponse> {
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
      const paymentId = `click_${Date.now()}_${order_id}`;
      const merchantTransId = `ORDER_${order_id}_${Date.now()}`;

      // Prepare Click payment data
      const paymentData = {
        service_id: parseInt(this.serviceId),
        merchant_id: this.merchantId,
        merchant_user_id: this.merchantUserId,
        amount: amount,
        transaction_param: merchantTransId,
        return_url: return_url || `${this.configService.get('FRONTEND_URL')}/payment/success`,
        description: description || `Buyurtma #${order.order_number} uchun to'lov`,
      };

      // Generate signature for payment creation
      const signature = this.generatePaymentSignature(paymentData);
      
      // Create payment URL
      const paymentUrl = this.buildPaymentUrl({ ...paymentData, sign: signature });

      // Save payment record
      await this.prisma.orderPayment.create({
        data: {
          order_id: order_id,
          amount: amount,
          payment_method: 'CLICK',
          transaction_id: paymentId,
          status: 'PENDING',
          gateway_response: {
            ...paymentData,
            payment_url: paymentUrl,
            merchant_trans_id: merchantTransId
          },
        },
      });

      this.logger.log(`Click payment created: ${paymentId} for order ${order_id}`);

      return {
        payment_url: paymentUrl,
        payment_id: paymentId,
        status: 'PENDING',
      };
    } catch (error) {
      this.logger.error('Error creating Click payment:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create Click payment');
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

      const newStatus = this.mapClickStatus(status);

      // Update payment status
      await this.prisma.orderPayment.update({
        where: { id: payment.id },
        data: { status: newStatus },
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

      this.logger.log(`Click payment verified: ${paymentId} - ${newStatus}`);
      return newStatus === 'PAID';
    } catch (error) {
      this.logger.error('Error verifying Click payment:', error);
      throw error;
    }
  }

  async handleCallback(callbackData: ClickCallbackData): Promise<any> {
    try {
      this.logger.log('Click callback received:', callbackData);

      const {
        click_trans_id,
        service_id,
        merchant_trans_id,
        amount,
        action,
        error,
        error_note,
        sign_time,
        sign_string
      } = callbackData;

      // Verify signature
      const isValidSignature = this.verifyCallbackSignature(callbackData);
      if (!isValidSignature) {
        this.logger.error('Invalid signature in Click callback');
        return this.createCallbackResponse(-1, 'Invalid signature');
      }

      // Verify service ID
      if (service_id !== parseInt(this.serviceId)) {
        this.logger.error('Invalid service ID in Click callback');
        return this.createCallbackResponse(-2, 'Invalid service ID');
      }

      // Extract order ID from merchant_trans_id
      const orderIdMatch = merchant_trans_id.match(/ORDER_(\d+)_/);
      if (!orderIdMatch) {
        this.logger.error('Invalid merchant transaction ID format');
        return this.createCallbackResponse(-3, 'Invalid transaction ID');
      }

      const orderId = parseInt(orderIdMatch[1]);

      // Find payment record
      const payment = await this.prisma.orderPayment.findFirst({
        where: {
          order_id: orderId,
          payment_method: 'CLICK'
        },
        include: { order: true }
      });

      if (!payment) {
        this.logger.error('Payment not found for Click callback');
        return this.createCallbackResponse(-4, 'Payment not found');
      }

      // Handle different actions
      switch (action) {
        case 0: // Prepare (check if payment is possible)
          return this.handlePrepareAction(payment, callbackData);
        case 1: // Complete payment
          return this.handleCompleteAction(payment, callbackData);
        default:
          this.logger.error(`Unknown Click action: ${action}`);
          return this.createCallbackResponse(-5, 'Unknown action');
      }
    } catch (error) {
      this.logger.error('Error handling Click callback:', error);
      return this.createCallbackResponse(-6, 'Internal server error');
    }
  }

  private async handlePrepareAction(payment: any, callbackData: ClickCallbackData): Promise<any> {
    // Validate payment can be processed
    if (payment.status === 'PAID') {
      return this.createCallbackResponse(-7, 'Payment already completed');
    }

    if (payment.status === 'CANCELLED' || payment.status === 'FAILED') {
      return this.createCallbackResponse(-8, 'Payment cannot be processed');
    }

    if (callbackData.amount !== payment.amount * 100) { // Click uses tiyin
      return this.createCallbackResponse(-9, 'Amount mismatch');
    }

    return this.createCallbackResponse(0, 'OK');
  }

  private async handleCompleteAction(payment: any, callbackData: ClickCallbackData): Promise<any> {
    try {
      if (callbackData.error !== 0) {
        // Payment failed
        await this.verifyPayment(payment.transaction_id, 'failed');
        return this.createCallbackResponse(callbackData.error, callbackData.error_note);
      }

      // Payment successful
      await this.verifyPayment(payment.transaction_id, 'success');
      
      // Update with Click transaction details
      await this.prisma.orderPayment.update({
        where: { id: payment.id },
        data: {
          gateway_response: {
            ...payment.gateway_response,
            click_trans_id: callbackData.click_trans_id,
            click_paydoc_id: callbackData.click_paydoc_id,
            completed_at: new Date().toISOString()
          }
        }
      });

      return this.createCallbackResponse(0, 'OK');
    } catch (error) {
      this.logger.error('Error completing Click payment:', error);
      return this.createCallbackResponse(-10, 'Processing error');
    }
  }

  async processRefund(transactionId: string, amount: number): Promise<any> {
    try {
      // Find original payment
      const payment = await this.prisma.orderPayment.findFirst({
        where: { transaction_id: transactionId }
      });

      if (!payment) {
        throw new BadRequestException('Original payment not found');
      }

      if (payment.status !== 'PAID') {
        throw new BadRequestException('Cannot refund unpaid payment');
      }

      // For Click, refunds are typically handled manually through their merchant panel
      // But we'll create a refund record for tracking
      const refundId = `click_refund_${Date.now()}`;
      
      this.logger.log(`Click refund requested: ${transactionId}, Amount: ${amount}`);
      
      return {
        success: true,
        refundId,
        amount,
        message: 'Refund request submitted. Please process through Click merchant panel.',
        manual_process_required: true
      };
    } catch (error) {
      this.logger.error('Error processing Click refund:', error);
      throw error;
    }
  }

  // Helper methods
  private generatePaymentSignature(data: any): string {
    // Click payment signature: service_id + merchant_id + amount + transaction_param + secret_key
    const signString = `${data.service_id}${data.merchant_id}${data.amount}${data.transaction_param}${this.secretKey}`;
    return crypto.createHash('md5').update(signString).digest('hex');
  }

  private verifyCallbackSignature(data: ClickCallbackData): boolean {
    // Click callback signature verification
    const signString = `${data.click_trans_id}${data.service_id}${this.secretKey}${data.merchant_trans_id}${data.amount}${data.action}${data.sign_time}`;
    const expectedSignature = crypto.createHash('md5').update(signString).digest('hex');
    return data.sign_string === expectedSignature;
  }

  private buildPaymentUrl(data: any): string {
    const params = new URLSearchParams({
      service_id: data.service_id.toString(),
      merchant_id: data.merchant_id,
      amount: data.amount.toString(),
      transaction_param: data.transaction_param,
      return_url: data.return_url,
      sign: data.sign
    });
    
    return `https://my.click.uz/services/pay?${params.toString()}`;
  }

  private createCallbackResponse(error: number, error_note: string): any {
    return {
      error,
      error_note
    };
  }

  private mapClickStatus(status: string): 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' {
    switch (status.toLowerCase()) {
      case 'success':
      case 'paid':
      case 'completed':
        return 'PAID';
      case 'failed':
      case 'error':
        return 'FAILED';
      case 'cancelled':
      case 'canceled':
        return 'CANCELLED';
      case 'pending':
      case 'processing':
      default:
        return 'PENDING';
    }
  }
}
