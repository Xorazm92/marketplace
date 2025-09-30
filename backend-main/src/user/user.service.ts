// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = await // @ts-ignore
    this.prisma.user.create({
      data: {
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        email: createUserDto.email,
        password: createUserDto.password,
        phone_number: createUserDto.phone_number,
      },
      include: {
        phone_numbers: true,
      },
    });
    return newUser;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return // @ts-ignore
    this.prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone_number: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByPhoneNumber(phone_number: string) {
    return // @ts-ignore
    this.prisma.phoneNumber.findFirst({
      where: { number: phone_number },
      include: { user: true }
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await // @ts-ignore
    this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async findOne(id: number) {
    return await // @ts-ignore
    this.prisma.user.findUnique({
      where: { id },
      include: {
        phone_numbers: true,
      },
    });
  }

  async findById(id: number) {
    return await // @ts-ignore
    this.prisma.user.findUnique({ where: { id } });
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    await // @ts-ignore
    this.prisma.user.update({
      where: { id: userId },
      data: { hashed_refresh_token: refreshToken }
    });
  }

  async remove(id: number) {
    return await // @ts-ignore
    this.prisma.user.delete({ where: { id } });
  }

  async blockUser(userId: string) {
    return // @ts-ignore
    this.prisma.user.update({
      where: { id: parseInt(userId) },
      data: { is_active: false },
    });
  }

  async searchUsers(searchTerm: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const whereClause: any = {
      OR: [
        { first_name: { contains: searchTerm, mode: 'insensitive' } },
        { last_name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ]
    };

    const [users, total] = await // @ts-ignore
    this.prisma.$transaction([
    this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
      }),
    this.prisma.user.count({ where: whereClause }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
