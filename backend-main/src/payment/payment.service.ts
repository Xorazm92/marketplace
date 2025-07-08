import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createPaymentDto: CreatePaymentDto) {
    const { amount, currency_id, payment_method_id, user_id } =
      createPaymentDto;

    const user = await this.prismaService.user.findUnique({
      where: { id: user_id },
    });
    if (!user) {
      throw new NotFoundException({
        status: 404,
        message: `Not found User who has got ID: ${user_id}`,
      });
    }

    const payment_method = await this.prismaService.paymentMethod.findUnique({
      where: { id: payment_method_id },
    });
    if (!payment_method) {
      throw new NotFoundException({
        status: 404,
        message: 'Not found Payment Method',
      });
    }

    const currency = await this.prismaService.currency.findUnique({
      where: { id: currency_id },
    });
    if (!currency) {
      throw new NotFoundException({
        status: 404,
        message: 'Not found this Currency',
      });
    }

    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    const duplicate = await this.prismaService.payment.findFirst({
      where: {
        user_id: user_id,
        payment_method_id: payment_method_id,
        amount: amount,
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000),
        },
      },
    });

    if (duplicate) throw new ConflictException('already paid this payment');

    const newPayment = await this.prismaService.payment.create({
      data: createPaymentDto,
    });

    return {
      status: 201,
      message: 'To‘lov muvaffaqiyatli yaratildi',
      data: newPayment,
    };
  }

  async findAll() {
    const result = await this.prismaService.payment.findMany();
    return result;
  }

  async findOne(id: number) {
    const payment = await this.prismaService.payment.findUnique({
      where: { id },
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {

    return this.prismaService.payment.update({
      where: { id },
      data: { ...updatePaymentDto, updatedAt: new Date() },
    });
  }

  async remove(id: number) {
    return this.prismaService.payment.delete({ where: { id } });
  }
}
