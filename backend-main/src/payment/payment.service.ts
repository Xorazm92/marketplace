import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, PaymentWebhookDto } from './dto/create-payment.dto';
import { PayPalService } from './services/paypal.service';
import { StripeService } from './services/stripe.service';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private paypalService: PayPalService,
    private stripeService: StripeService,
  ) {}

  async initiatePayment(createPaymentDto: CreatePaymentDto, userId: number) {
    const { order_id, amount, payment_method, currency = 'USD', return_url, cancel_url } = createPaymentDto;

    // Verify order exists and belongs to user
    const order = await this.prisma.order.findUnique({
      where: { id: order_id },
      include: { user: true }
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    if (order.user_id !== userId) {
      throw new HttpException('Unauthorized access to order', HttpStatus.FORBIDDEN);
    }

    // Generate unique transaction ID
    const transaction_id = `${payment_method.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = await this.prisma.orderPayment.create({
      data: {
        transaction_id,
        amount,
        payment_method,
        status: 'PENDING',
        order_id,
        gateway_response: {}
      }
    });

    // Process payment based on method
    let paymentResponse;
    try {
      switch (payment_method) {
        case 'PAYPAL':
          paymentResponse = await this.paypalService.createOrder(
            amount,
            currency,
            return_url || `${process.env.FRONTEND_URL}/payment/success`,
            cancel_url || `${process.env.FRONTEND_URL}/payment/cancel`
          );
          break;
        case 'STRIPE':
          paymentResponse = await this.stripeService.createPaymentIntent(
            amount,
            currency.toLowerCase(),
            { order_id: order_id.toString(), payment_id: payment.id.toString() }
          );
          break;
        case 'CLICK':
        case 'PAYME':
        case 'UZCARD':
          paymentResponse = await this.processLocalPayment(payment_method, amount, currency, transaction_id);
          break;
        default:
          throw new HttpException('Unsupported payment method', HttpStatus.BAD_REQUEST);
      }

      // Update payment with gateway response
      await this.prisma.orderPayment.update({
        where: { id: payment.id },
        data: {
          gateway_response: paymentResponse,
          transaction_id: paymentResponse.id || paymentResponse.client_secret || transaction_id
        }
      });

      return {
        payment_id: payment.id,
        transaction_id: payment.transaction_id,
        ...paymentResponse,
      };
    } catch (error) {
      await this.prisma.orderPayment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          gateway_response: { error: error.message }
        }
      });
      throw error;
    }
  }

  private async processLocalPayment(method: string, amount: number, currency: string, transactionId: string) {
    // Mock implementation for local payment methods
    // In production, integrate with actual payment gateways
    return {
      id: transactionId,
      status: 'requires_confirmation',
      payment_url: `${process.env.FRONTEND_URL}/payment/local/${method.toLowerCase()}/${transactionId}`,
      method,
    };
  }

  async confirmPayment(paymentId: number, gatewayData: any) {
    const payment = await this.prisma.orderPayment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    try {
      let confirmationResult;
      
      switch (payment.payment_method) {
        case 'PAYPAL':
          confirmationResult = await this.paypalService.captureOrder(gatewayData.orderId);
          break;
        case 'STRIPE':
          confirmationResult = await this.stripeService.confirmPaymentIntent(gatewayData.paymentIntentId);
          break;
        default:
          confirmationResult = { status: 'succeeded' }; // For local methods
      }

      // Update payment status
      const newStatus = confirmationResult.status === 'succeeded' || confirmationResult.status === 'COMPLETED' ? 'PAID' : 'FAILED';
      
      const updatedPayment = await this.prisma.orderPayment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          gateway_response: { ...(payment.gateway_response as object || {}), confirmation: confirmationResult }
        }
      });

      // Update order status if payment completed
      if (newStatus === 'PAID') {
        await this.prisma.order.update({
          where: { id: payment.order_id },
          data: { status: 'CONFIRMED' }
        });
      }

      return updatedPayment;
    } catch (error) {
      await this.prisma.orderPayment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED',
          gateway_response: { ...(payment.gateway_response as object || {}), error: error.message }
        }
      });
      throw error;
    }
  }

  async handleWebhook(webhookDto: PaymentWebhookDto, paymentMethod: string) {
    const payment = await this.prisma.orderPayment.findFirst({
      where: { transaction_id: webhookDto.transaction_id }
    });

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    // Update payment status based on webhook
    const statusMap = {
      'completed': 'PAID',
      'succeeded': 'PAID',
      'failed': 'FAILED',
      'cancelled': 'CANCELLED',
      'refunded': 'REFUNDED'
    };

    const newStatus = statusMap[webhookDto.status.toLowerCase()] || 'PROCESSING';
    
    await this.prisma.orderPayment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        gateway_response: { ...(payment.gateway_response as object || {}), webhook: webhookDto.gateway_data }
      }
    });

    // Update order status if payment completed
    if (newStatus === 'PAID') {
      await this.prisma.order.update({
        where: { id: payment.order_id },
        data: { status: 'CONFIRMED' }
      });
    }

    return { success: true, payment_id: payment.id };
  }

  async getPaymentHistory(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [payments, total] = await Promise.all([
      this.prisma.orderPayment.findMany({
        where: { 
          order: { user_id: userId }
        },
        include: { order: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.orderPayment.count({
        where: { 
          order: { user_id: userId }
        }
      })
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
  }

  async refundPayment(paymentId: number, amount?: number) {
    const payment = await this.prisma.orderPayment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    if (payment.status !== 'PAID') {
      throw new HttpException('Cannot refund non-completed payment', HttpStatus.BAD_REQUEST);
    }

    const refundAmount = amount || payment.amount;
    
    try {
      let refundResult;
      
      switch (payment.payment_method) {
        case 'PAYPAL':
          refundResult = await this.paypalService.refundPayment(
            payment.transaction_id,
            Number(refundAmount),
            'USD'
          );
          break;
        case 'STRIPE':
          refundResult = await this.stripeService.createRefund(
            payment.transaction_id,
            Number(refundAmount)
          );
          break;
        default:
          // Mock refund for local methods
          refundResult = {
            id: `refund_${Date.now()}`,
            status: 'succeeded',
            amount: refundAmount
          };
      }

      // Update payment status
      const newStatus = refundAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
      
      await this.prisma.orderPayment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          gateway_response: { ...(payment.gateway_response as object || {}), refund: refundResult }
        }
      });

      return refundResult;
    } catch (error) {
      throw new HttpException(`Refund failed: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  // Admin methods
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [payments, total] = await Promise.all([
      this.prisma.orderPayment.findMany({
        include: { 
          order: { 
            include: { user: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.orderPayment.count()
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
  }

  async findOne(id: number) {
    const payment = await this.prisma.orderPayment.findUnique({
      where: { id },
      include: { 
        order: { 
          include: { user: true }
        }
      }
    });

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    return payment;
  }

  async getPaymentStats() {
    const [totalPayments, totalRevenue, successfulPayments, failedPayments] = await Promise.all([
      this.prisma.orderPayment.count(),
      this.prisma.orderPayment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true }
      }),
      this.prisma.orderPayment.count({ where: { status: 'PAID' } }),
      this.prisma.orderPayment.count({ where: { status: 'FAILED' } })
    ]);

    return {
      total_payments: totalPayments,
      total_revenue: totalRevenue._sum.amount || 0,
      successful_payments: successfulPayments,
      failed_payments: failedPayments
    };
  }
}
