
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: createPaymentDto,
      include: {
        user: true,
        payment_method: true,
        currency: true
      }
    });
  }

  async processPayment(orderId: number, paymentData: any) {
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
      throw new Error('Order not found');
    }

    try {
      let paymentResult;
      
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
        case 'CASH_ON_DELIVERY':
          paymentResult = await this.processCashOnDelivery(order);
          break;
        default:
          throw new Error('Unsupported payment method');
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

      // Update order status
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          payment_status: paymentResult.status,
          status: paymentResult.status === 'PAID' ? 'CONFIRMED' : 'PENDING'
        }
      });

      return payment;
    } catch (error) {
      // Log error and update order status
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          payment_status: 'FAILED'
        }
      });

      throw error;
    }
  }

  private async processCardPayment(order: any, paymentData: any) {
    // Integration with card payment gateway
    // This is a mock implementation
    return {
      transactionId: `card_${Date.now()}`,
      status: 'PAID',
      response: {
        success: true,
        message: 'Payment successful'
      }
    };
  }

  private async processClickPayment(order: any, paymentData: any) {
    // Integration with Click payment system
    // This is a mock implementation
    return {
      transactionId: `click_${Date.now()}`,
      status: 'PAID',
      response: {
        success: true,
        message: 'Click payment successful'
      }
    };
  }

  private async processPaymePayment(order: any, paymentData: any) {
    // Integration with Payme payment system
    // This is a mock implementation
    return {
      transactionId: `payme_${Date.now()}`,
      status: 'PAID',
      response: {
        success: true,
        message: 'Payme payment successful'
      }
    };
  }

  private async processCashOnDelivery(order: any) {
    return {
      transactionId: `cod_${Date.now()}`,
      status: 'PENDING',
      response: {
        success: true,
        message: 'Cash on delivery order created'
      }
    };
  }

  async getPaymentHistory(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
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
  }

  async refundPayment(paymentId: number, amount?: number) {
    const payment = await this.prisma.orderPayment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const refundAmount = amount || payment.amount;
    
    // Process refund based on payment method
    const refundResult = await this.processRefund(payment, refundAmount);

    // Update payment status
    await this.prisma.orderPayment.update({
      where: { id: paymentId },
      data: {
        status: refundAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
      }
    });

    return refundResult;
  }

  private async processRefund(payment: any, amount: number) {
    // Process refund based on payment method
    // This is a mock implementation
    return {
      success: true,
      refundId: `refund_${Date.now()}`,
      amount,
      message: 'Refund processed successfully'
    };
  }
}
