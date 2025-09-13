
import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ClickService } from './services/click.service';
import { PaymeService } from './services/payme.service';
import { UzumService } from './services/uzum.service';

export interface PaymentProcessResult {
  transactionId: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  paymentUrl?: string;
  response: any;
}

export interface ProcessPaymentRequest {
  method: 'CARD' | 'CLICK' | 'PAYME' | 'UZUM' | 'CASH_ON_DELIVERY';
  returnUrl?: string;
  cancelUrl?: string;
  description?: string;
  cardDetails?: {
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    cardHolderName?: string;
  };
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly clickService: ClickService,
    private readonly paymeService: PaymeService,
    private readonly uzumService: UzumService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      return await this.prisma.payment.create({
        data: createPaymentDto,
        include: {
          user: true,
          payment_method: true,
          currency: true
        }
      });
    } catch (error) {
      this.logger.error('Error creating payment:', error);
      throw new BadRequestException('Failed to create payment');
    }
  }

  async processPayment(orderId: number, paymentData: ProcessPaymentRequest): Promise<PaymentProcessResult> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.payment_status === 'PAID') {
      throw new BadRequestException('Order already paid');
    }

    try {
      let paymentResult: PaymentProcessResult;
      
      switch (paymentData.method) {
        case 'CARD':
          paymentResult = await this.processCardPayment(order, paymentData);
          break;
        case 'CLICK':
          paymentResult = await this.processClickPayment(order, paymentData);
          break;
        case 'PAYME':
          paymentResult = await this.processPaymePayment(order, paymentData);
          break;
        case 'UZUM':
          paymentResult = await this.processUzumPayment(order, paymentData);
          break;
        case 'CASH_ON_DELIVERY':
          paymentResult = await this.processCashOnDelivery(order);
          break;
        default:
          throw new BadRequestException(`Unsupported payment method: ${paymentData.method}`);
      }

      // Create payment record
      const payment = await this.prisma.orderPayment.create({
        data: {
          order_id: orderId,
          amount: order.final_amount,
          payment_method: paymentData.method,
          transaction_id: paymentResult.transactionId,
          status: paymentResult.status,
          gateway_response: paymentResult.response
        }
      });

      // Update order status only if payment is successful
      if (paymentResult.status === 'PAID') {
        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            payment_status: 'PAID',
            status: 'CONFIRMED'
          }
        });
      } else if (paymentResult.status === 'PENDING') {
        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            payment_status: 'PENDING'
          }
        });
      }

      this.logger.log(`Payment processed: Order ${orderId}, Method: ${paymentData.method}, Status: ${paymentResult.status}`);
      
      return {
        ...paymentResult,
        paymentId: payment.id
      } as any;
    } catch (error) {
      this.logger.error(`Error processing payment for order ${orderId}:`, error);
      
      // Update order status to failed
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          payment_status: 'FAILED'
        }
      });

      throw error;
    }
  }

  private async processCardPayment(order: any, paymentData: ProcessPaymentRequest): Promise<PaymentProcessResult> {
    try {
      // Enhanced card payment processing with proper validation
      if (!paymentData.cardDetails) {
        throw new BadRequestException('Card details are required for card payment');
      }

      const { cardNumber, expiryMonth, expiryYear, cvv, cardHolderName } = paymentData.cardDetails;
      
      // Basic validation
      if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardHolderName) {
        throw new BadRequestException('All card details are required');
      }

      // Simulate card processing (replace with actual payment processor)
      const transactionId = `card_${Date.now()}_${order.id}`;
      
      // Mock response - replace with actual card processing
      const success = Math.random() > 0.1; // 90% success rate for testing
      
      return {
        transactionId,
        status: success ? 'PAID' : 'FAILED',
        response: {
          success,
          message: success ? 'Card payment successful' : 'Card payment failed',
          cardLast4: cardNumber.slice(-4),
          authCode: success ? `AUTH_${Math.random().toString(36).substring(7)}` : null
        }
      };
    } catch (error) {
      this.logger.error('Card payment processing error:', error);
      throw new BadRequestException('Card payment processing failed');
    }
  }

  private async processClickPayment(order: any, paymentData: ProcessPaymentRequest): Promise<PaymentProcessResult> {
    try {
      const clickPayment = await this.clickService.createPayment({
        order_id: order.id,
        amount: order.final_amount,
        return_url: paymentData.returnUrl,
        description: paymentData.description || `Payment for order #${order.order_number}`
      });

      return {
        transactionId: clickPayment.payment_id,
        status: 'PENDING',
        paymentUrl: clickPayment.payment_url,
        response: {
          success: true,
          message: 'Click payment initiated',
          payment_url: clickPayment.payment_url
        }
      };
    } catch (error) {
      this.logger.error('Click payment processing error:', error);
      throw new BadRequestException('Click payment processing failed');
    }
  }

  private async processPaymePayment(order: any, paymentData: ProcessPaymentRequest): Promise<PaymentProcessResult> {
    try {
      const paymePayment = await this.paymeService.createPayment({
        order_id: order.id,
        amount: order.final_amount,
        return_url: paymentData.returnUrl,
        description: paymentData.description || `Payment for order #${order.order_number}`
      });

      return {
        transactionId: paymePayment.payment_id,
        status: 'PENDING',
        paymentUrl: paymePayment.payment_url,
        response: {
          success: true,
          message: 'Payme payment initiated',
          payment_url: paymePayment.payment_url
        }
      };
    } catch (error) {
      this.logger.error('Payme payment processing error:', error);
      throw new BadRequestException('Payme payment processing failed');
    }
  }

  private async processUzumPayment(order: any, paymentData: ProcessPaymentRequest): Promise<PaymentProcessResult> {
    try {
      const uzumPayment = await this.uzumService.createPayment({
        order_id: order.id,
        amount: order.final_amount,
        return_url: paymentData.returnUrl,
        cancel_url: paymentData.cancelUrl,
        description: paymentData.description || `Payment for order #${order.order_number}`
      });

      return {
        transactionId: uzumPayment.payment_id,
        status: 'PENDING',
        paymentUrl: uzumPayment.payment_url,
        response: {
          success: true,
          message: 'Uzum payment initiated',
          payment_url: uzumPayment.payment_url
        }
      };
    } catch (error) {
      this.logger.error('Uzum payment processing error:', error);
      throw new BadRequestException('Uzum payment processing failed');
    }
  }

  private async processCashOnDelivery(order: any): Promise<PaymentProcessResult> {
    return {
      transactionId: `cod_${Date.now()}_${order.id}`,
      status: 'PENDING',
      response: {
        success: true,
        message: 'Cash on delivery order created',
        instructions: 'Payment will be collected upon delivery'
      }
    };
  }

  async getPaymentHistory(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    try {
      const [payments, total] = await Promise.all([
        this.prisma.payment.findMany({
          where: { user_id: userId },
          skip,
          take: limit,
          include: {
            payment_method: true,
            currency: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.payment.count({ where: { user_id: userId } })
      ]);

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.logger.error('Error fetching payment history:', error);
      throw new BadRequestException('Failed to fetch payment history');
    }
  }

  async getPaymentStatus(orderId: number): Promise<any> {
    try {
      const payment = await this.prisma.orderPayment.findFirst({
        where: { order_id: orderId },
        include: { order: true },
        orderBy: { createdAt: 'desc' }
      });

      if (!payment) {
        throw new NotFoundException('Payment not found for this order');
      }

      return {
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount,
        method: payment.payment_method,
        status: payment.status,
        transactionId: payment.transaction_id,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      };
    } catch (error) {
      this.logger.error('Error fetching payment status:', error);
      throw error;
    }
  }

  async refundPayment(paymentId: number, amount?: number) {
    try {
      const payment = await this.prisma.orderPayment.findUnique({
        where: { id: paymentId },
        include: { order: true }
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== 'PAID') {
        throw new BadRequestException('Cannot refund unpaid payment');
      }

      const refundAmount = amount || payment.amount;
      
      if (refundAmount > payment.amount) {
        throw new BadRequestException('Refund amount cannot exceed payment amount');
      }

      // Process refund based on payment method
      const refundResult = await this.processRefund(payment, Number(refundAmount));

      // Update payment status
      const newStatus = refundAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
      
      await this.prisma.orderPayment.update({
        where: { id: paymentId },
        data: { status: newStatus }
      });

      // Update order status if fully refunded
      if (newStatus === 'REFUNDED') {
        await this.prisma.order.update({
          where: { id: payment.order_id },
          data: {
            status: 'REFUNDED',
            payment_status: 'REFUNDED'
          }
        });
      }

      this.logger.log(`Payment refunded: ${paymentId}, Amount: ${refundAmount}`);
      return refundResult;
    } catch (error) {
      this.logger.error('Error processing refund:', error);
      throw error;
    }
  }

  private async processRefund(payment: any, amount: number) {
    try {
      // Process refund based on payment method
      switch (payment.payment_method) {
        case 'CLICK':
          return await this.clickService.processRefund(payment.transaction_id, amount);
        case 'PAYME':
          return await this.paymeService.processRefund(payment.transaction_id, amount);
        case 'UZUM':
          return await this.uzumService.processRefund(payment.transaction_id, amount);
        case 'CARD':
          // Process card refund
          return {
            success: true,
            refundId: `card_refund_${Date.now()}`,
            amount,
            message: 'Card refund processed successfully'
          };
        default:
          throw new BadRequestException(`Refund not supported for payment method: ${payment.payment_method}`);
      }
    } catch (error) {
      this.logger.error('Refund processing error:', error);
      throw new BadRequestException('Refund processing failed');
    }
  }

  // Webhook handlers for different payment gateways
  async handleClickWebhook(webhookData: any): Promise<any> {
    try {
      return await this.clickService.handleCallback(webhookData);
    } catch (error) {
      this.logger.error('Click webhook error:', error);
      throw new BadRequestException('Click webhook processing failed');
    }
  }

  async handlePaymeWebhook(webhookData: any): Promise<any> {
    try {
      return await this.paymeService.handleCallback(webhookData);
    } catch (error) {
      this.logger.error('Payme webhook error:', error);
      throw new BadRequestException('Payme webhook processing failed');
    }
  }

  async handleUzumWebhook(webhookData: any): Promise<any> {
    try {
      return await this.uzumService.handleCallback(webhookData);
    } catch (error) {
      this.logger.error('Uzum webhook error:', error);
      throw new BadRequestException('Uzum webhook processing failed');
    }
  }

  // CRUD methods needed by controller
  async create(createPaymentDto: CreatePaymentDto) {
    return this.createPayment(createPaymentDto);
  }

  async findAll(page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const [payments, total] = await Promise.all([
        this.prisma.payment.findMany({
          skip,
          take: limit,
          include: {
            user: {
              select: { id: true, first_name: true, last_name: true, email: true }
            },
            payment_method: true,
            currency: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.payment.count()
      ]);

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.logger.error('Error fetching all payments:', error);
      throw new BadRequestException('Failed to fetch payments');
    }
  }

  async findOne(id: number) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, first_name: true, last_name: true, email: true }
          },
          payment_method: true,
          currency: true
        }
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      return payment;
    } catch (error) {
      this.logger.error('Error fetching payment:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch payment');
    }
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    try {
      const existingPayment = await this.prisma.payment.findUnique({ where: { id } });
      
      if (!existingPayment) {
        throw new NotFoundException('Payment not found');
      }

      return await this.prisma.payment.update({
        where: { id },
        data: updatePaymentDto,
        include: {
          user: {
            select: { id: true, first_name: true, last_name: true, email: true }
          },
          payment_method: true,
          currency: true
        }
      });
    } catch (error) {
      this.logger.error('Error updating payment:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update payment');
    }
  }

  async remove(id: number) {
    try {
      const existingPayment = await this.prisma.payment.findUnique({ where: { id } });
      
      if (!existingPayment) {
        throw new NotFoundException('Payment not found');
      }

      return await this.prisma.payment.delete({
        where: { id }
      });
    } catch (error) {
      this.logger.error('Error deleting payment:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete payment');
    }
  }

  // Additional utility methods
  async getPaymentStatistics(dateFrom?: Date, dateTo?: Date) {
    try {
      const whereClause: any = {};
      
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt.gte = dateFrom;
        if (dateTo) whereClause.createdAt.lte = dateTo;
      }

      const [totalPayments, totalAmount, paymentsByMethod, paymentsByStatus] = await Promise.all([
        this.prisma.orderPayment.count({ where: whereClause }),
        this.prisma.orderPayment.aggregate({
          where: whereClause,
          _sum: { amount: true }
        }),
        this.prisma.orderPayment.groupBy({
          by: ['payment_method'],
          where: whereClause,
          _count: { payment_method: true },
          _sum: { amount: true }
        }),
        this.prisma.orderPayment.groupBy({
          by: ['status'],
          where: whereClause,
          _count: { status: true },
          _sum: { amount: true }
        })
      ]);

      return {
        totalPayments,
        totalAmount: totalAmount._sum.amount || 0,
        paymentsByMethod,
        paymentsByStatus,
        period: {
          from: dateFrom,
          to: dateTo
        }
      };
    } catch (error) {
      this.logger.error('Error fetching payment statistics:', error);
      throw new BadRequestException('Failed to fetch payment statistics');
    }
  }
}
