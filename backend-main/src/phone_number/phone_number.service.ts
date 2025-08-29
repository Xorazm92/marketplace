import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePhoneNumberDto } from './dto/create-phone_number.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone_number.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class PhoneNumberService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPhoneNumberDto: CreatePhoneNumberDto) {
    throw new Error('PhoneNumber service is deprecated. Use User.phone_number field instead.');
  }

  async findAll() {
    throw new Error('PhoneNumber service is deprecated. Use User.phone_number field instead.');
  }

  async findOne(id: number) {
    throw new Error('PhoneNumber service is deprecated. Use User.phone_number field instead.');
  }

  async findByUser(id: number | string) {
    throw new Error('PhoneNumber service is deprecated. Use User.phone_number field instead.');
  }

  async update(id: number, updatePhoneNumberDto: UpdatePhoneNumberDto) {
    throw new Error('PhoneNumber service is deprecated. Use User.phone_number field instead.');
  }

  async remove(id: number, phoneId: number) {
    throw new Error('PhoneNumber service is deprecated. Use User.phone_number field instead.');
  }
}
