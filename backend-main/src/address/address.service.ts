// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAddressDto: any) {
    return this.prisma.address.create({ data: createAddressDto });
  }

  async findAll(findAddressDto: any) {
    return this.prisma.address.findMany();
  }

  async findOne(id: string) {
    return this.prisma.address.findUnique({ where: { id: parseInt(id) } });
  }

  async update(id: string, updateAddressDto: any) {
    return this.prisma.address.update({
      where: { id: parseInt(id) },
      data: updateAddressDto
    });
  }

  async remove(id: string) {
    return this.prisma.address.delete({ where: { id: parseInt(id) } });
  }
}
