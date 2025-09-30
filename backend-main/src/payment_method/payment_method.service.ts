// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { CreatePaymentMethodDto } from './dto/create-payment_method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment_method.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentMethodService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createPaymentMethodDto: CreatePaymentMethodDto) {
    return // @ts-ignore
    this.prismaService.paymentMethod.create({
      data: { ...createPaymentMethodDto, code: createPaymentMethodDto.name.toUpperCase() },
    });
  }

  findAll() {
    return // @ts-ignore
    this.prismaService.paymentMethod.findMany();
  }

  findOne(id: number) {
    return // @ts-ignore
    this.prismaService.paymentMethod.findUnique({ where: { id } });
  }

  update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    return // @ts-ignore
    this.prismaService.paymentMethod.update({
      where: { id },
      data: updatePaymentMethodDto,
    });
  }

  remove(id: number) {
    return // @ts-ignore
    this.prismaService.paymentMethod.delete({ where: { id } });
  }
}
