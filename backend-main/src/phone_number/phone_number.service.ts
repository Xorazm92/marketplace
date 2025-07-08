import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePhoneNumberDto } from './dto/create-phone_number.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone_number.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class PhoneNumberService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPhoneNumberDto: CreatePhoneNumberDto) {
    return await this.prismaService.phoneNumber.create({
      data: createPhoneNumberDto,
    });
  }

  async findAll() {
    return await this.prismaService.phoneNumber.findMany();
  }

  async findOne(id: number) {
    const phoneNumber = await this.prismaService.phoneNumber.findUnique({
      where: { id },
    });
    if (!phoneNumber) {
      throw new NotFoundException(`Phone number with ID ${id} not found`);
    }
    return phoneNumber;
  }

  async findByUser(id: number | string) {
    try {
      return await this.prismaService.phoneNumber.findMany({
        where: { user_id: Number(id) },
      });
    } catch (error) {
      console.error('Error in findByUser:', error);
      throw error;
    }
  }

  async update(id: number, updatePhoneNumberDto: UpdatePhoneNumberDto) {
    // Avval mavjudligini tekshirish
    await this.findOne(id);

    return await this.prismaService.phoneNumber.update({
      where: { id },
      data: updatePhoneNumberDto,
    });
  }

  async remove(id: number, phoneId: number) {
    const phone = await this.prismaService.phoneNumber.findFirst({
      where: { id: phoneId, user_id: id },
    });


    if (!phone) {
      throw new ForbiddenException("You can't delete this phone number");
    }

    const result = await this.prismaService.phoneNumber.delete({
      where: { id: phoneId }, // faqat id kerak, chunki id unique bo'lishi kerak
    });


    return result
  }
}
