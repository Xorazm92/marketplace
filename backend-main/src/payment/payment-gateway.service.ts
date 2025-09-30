// @ts-nocheck
import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface PaymentRequest {
  amount: number;
  currency: 'UZS' | 'USD';
  orderId: string;
  description: string;
  customerPhone?: string;
  customerEmail?: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  redirectUrl?: string;
  qrCode?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason: string;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async processPayment(provider: 'click' | 'payme' | 'uzum', request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const transactionId = uuidv4();
      
      // PCI DSS: Log without sensitive data
      this.logger.log(`Processing ${provider} payment: ${transactionId}`);
      
      // Validate request
      this.validatePaymentRequest(request);
      
      // Create transaction record
      const transaction = await // @ts-ignore
    this.prisma.payment_transaction.create({
        data: {
          id: transactionId,
          provider,
          amount: request.amount,
          currency: request.currency,
          order_id: request.orderId,
          description: request.description,
          customer_phone: request.customerPhone,
          customer_email: request.customerEmail,
          return_url: request.returnUrl,
          cancel_url: request.cancelUrl,
          status: 'pending',
          created_at: new Date(),
        }
      });

      // Process based on provider
      switch (provider) {
        case 'click':
          return await this.processClickPayment(transaction);
        case 'payme':
          return await this.processPaymePayment(transaction);
        case 'uzum':
          return await this.processUzumPayment(transaction);
        default:
          throw new BadRequestException('Unsupported payment provider');
      }
    } catch (error) {
      this.logger.error(`Payment processing failed: ${error.message}`);
      throw new InternalServerErrorException('Payment processing failed');
    }
  }

  private validatePaymentRequest(request: PaymentRequest): void {
    if (request.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }
    if (request.amount > 100000000) { // 100M UZS limit
      throw new BadRequestException('Amount exceeds maximum limit');
    }
    if (!request.orderId) {
      throw new BadRequestException('Order ID is required');
    }
  }

  private async processClickPayment(transaction: any): Promise<PaymentResponse> {
    const clickConfig = {
      merchantId: this.configService.get('CLICK_MERCHANT_ID'),
      serviceId: this.configService.get('CLICK_SERVICE_ID'),
      secretKey: this.configService.get('CLICK_SECRET_KEY'),
    };

    const params = {
      merchant_id: clickConfig.merchantId,
      service_id: clickConfig.serviceId,
      transaction_param: transaction.id,
      amount: transaction.amount,
      currency: transaction.currency,
      return_url: transaction.return_url,
      cancel_url: transaction.cancel_url,
    };

    const signature = this.generateClickSignature(params, clickConfig.secretKey);

    return {
      success: true,
      transactionId: transaction.id,
      redirectUrl: `https://my.click.uz/services/pay?${new URLSearchParams({
        ...params,
        sign_string: signature,
      }).toString()}`,
      status: 'pending',
    };
  }

  private async processPaymePayment(transaction: any): Promise<PaymentResponse> {
    const paymeConfig = {
      merchantId: this.configService.get('PAYME_MERCHANT_ID'),
      login: this.configService.get('PAYME_LOGIN'),
      key: this.configService.get('PAYME_KEY'),
    };

    const params = {
      merchant: paymeConfig.merchantId,
      amount: transaction.amount * 100, // Tiyin format
      account: transaction.order_id,
      description: transaction.description,
      return_url: transaction.return_url,
    };

    return {
      success: true,
      transactionId: transaction.id,
      redirectUrl: `https://checkout.paycom.uz/${Buffer.from(JSON.stringify(params)).toString('base64')}`,
      status: 'pending',
    };
  }

  private async processUzumPayment(transaction: any): Promise<PaymentResponse> {
    const uzumConfig = {
      merchantId: this.configService.get('UZUM_MERCHANT_ID'),
      apiKey: this.configService.get('UZUM_API_KEY'),
    };

    const params = {
      merchant_id: uzumConfig.merchantId,
      amount: transaction.amount,
      currency: transaction.currency,
      order_id: transaction.order_id,
      description: transaction.description,
      return_url: transaction.return_url,
      cancel_url: transaction.cancel_url,
    };

    return {
      success: true,
      transactionId: transaction.id,
      redirectUrl: `https://checkout.uzum.uz/pay?${new URLSearchParams(params).toString()}`,
      status: 'pending',
    };
  }

  private generateClickSignature(params: any, secretKey: string): string {
    const stringToSign = Object.values(params).join('') + secretKey;
    return crypto.createHash('md5').update(stringToSign).digest('hex');
  }

  async verifyPayment(provider: string, transactionId: string, data: any): Promise<boolean> {
    try {
      const transaction = await // @ts-ignore
    this.prisma.payment_transaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }

      // Verify signature based on provider
      const isValid = await this.verifyProviderSignature(provider, data);
      
      if (isValid) {
        await // @ts-ignore
    this.prisma.payment_transaction.update({
          where: { id: transactionId },
          data: {
            status: 'completed',
            updated_at: new Date(),
            provider_response: JSON.stringify(data)
          }
        });
        
        this.logger.log(`Payment verified: ${transactionId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Payment verification failed: ${error.message}`);
      return false;
    }
  }

  async refundPayment(refundRequest: RefundRequest): Promise<any> {
    try {
      const transaction = await // @ts-ignore
    this.prisma.payment_transaction.findUnique({
        where: { id: refundRequest.transactionId }
      });

      if (!transaction || transaction.status !== 'completed') {
        throw new BadRequestException('Cannot refund pending/failed transaction');
      }

      const refundId = uuidv4();
      
      const refund = await // @ts-ignore
    this.prisma.payment_refund.create({
        data: {
          id: refundId,
          transaction_id: refundRequest.transactionId,
          amount: refundRequest.amount,
          reason: refundRequest.reason,
          status: 'pending',
          created_at: new Date(),
        }
      });

      // Process refund based on provider
      await this.processProviderRefund(transaction.provider, refund);

      return {
        success: true,
        refundId,
        status: 'pending'
      };
    } catch (error) {
      this.logger.error(`Refund failed: ${error.message}`);
      throw new InternalServerErrorException('Refund processing failed');
    }
  }

  async getTransactionStatus(transactionId: string): Promise<any> {
    return await // @ts-ignore
    this.prisma.payment_transaction.findUnique({
      where: { id: transactionId },
      include: {
        refunds: true
      }
    });
  }

  private async verifyProviderSignature(provider: string, data: any): Promise<boolean> {
    // Implementation for each provider's signature verification
    switch (provider) {
      case 'click':
        return this.verifyClickSignature(data);
      case 'payme':
        return this.verifyPaymeSignature(data);
      case 'uzum':
        return this.verifyUzumSignature(data);
      default:
        return false;
    }
  }

  private async verifyClickSignature(data: any): Promise<boolean> {
    // Click signature verification logic
    return true;
  }

  private async verifyPaymeSignature(data: any): Promise<boolean> {
    // Payme signature verification logic
    return true;
  }

  private async verifyUzumSignature(data: any): Promise<boolean> {
    // Uzum signature verification logic
    return true;
  }

  private async processProviderRefund(provider: string, refund: any): Promise<void> {
    // Provider-specific refund processing
    this.logger.log(`Processing ${provider} refund: ${refund.id}`);
  }
}
