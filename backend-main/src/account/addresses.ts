import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { UserGuard } from '../guards/user.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';
import { normalizeUzPhone } from '../identity/phone';

// Egasi har doim tokendan olinadi: ilgari user_id DTO'da edi, GET /address/:id
// ochiq edi va PATCH manzil id'sini user id bilan solishtirardi.
export class AddressDto {
  @IsString()
  @Length(1, 60)
  name: string;

  @IsInt()
  region_id: number;

  @IsOptional()
  @IsInt()
  district_id?: number;

  @IsString()
  @Length(3, 300)
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone_number?: string;

  @IsOptional()
  @IsBoolean()
  is_main?: boolean;
}

class UpdateAddressDto extends PartialType(AddressDto) {}

const ADDRESS_SELECT = {
  id: true,
  name: true,
  address: true,
  phone_number: true,
  is_main: true,
  region: { select: { id: true, name: true } },
  district: { select: { id: true, name: true } },
};

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: number) {
    return this.prisma.address.findMany({ where: { user_id: userId }, select: ADDRESS_SELECT, orderBy: [{ is_main: 'desc' }, { id: 'desc' }] });
  }

  async create(userId: number, dto: AddressDto) {
    const data = await this.clean(dto);
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.address.count({ where: { user_id: userId } });
      const isMain = dto.is_main || count === 0;
      if (isMain) await tx.address.updateMany({ where: { user_id: userId }, data: { is_main: false } });
      return tx.address.create({ data: { ...data, user_id: userId, is_main: isMain }, select: ADDRESS_SELECT });
    });
  }

  async update(userId: number, id: number, dto: UpdateAddressDto) {
    await this.own(userId, id);
    const data = await this.clean(dto);
    return this.prisma.$transaction(async (tx) => {
      if (dto.is_main) await tx.address.updateMany({ where: { user_id: userId }, data: { is_main: false } });
      return tx.address.update({ where: { id }, data, select: ADDRESS_SELECT });
    });
  }

  async remove(userId: number, id: number) {
    await this.own(userId, id);
    // Buyurtmaga bog'langan manzil o'chirilmaydi: buyurtmada nusxasi bor, lekin FK saqlanadi.
    const used = await this.prisma.order.count({ where: { shipping_address_id: id } });
    if (used > 0) throw new BadRequestException("Bu manzil buyurtmalarda ishlatilgan, uni o'chirib bo'lmaydi");
    await this.prisma.address.delete({ where: { id } });
    return { success: true };
  }

  private async own(userId: number, id: number) {
    const address = await this.prisma.address.findFirst({ where: { id, user_id: userId }, select: { id: true } });
    if (!address) throw new NotFoundException('Manzil topilmadi');
  }

  private async clean<T extends Partial<AddressDto>>(dto: T) {
    if (dto.region_id != null) {
      const region = await this.prisma.region.findUnique({ where: { id: dto.region_id } });
      if (!region) throw new BadRequestException('Viloyat topilmadi');
    }
    if (dto.district_id != null) {
      const district = await this.prisma.district.findUnique({ where: { id: dto.district_id } });
      if (!district || (dto.region_id != null && district.region_id !== dto.region_id)) {
        throw new BadRequestException('Tuman topilmadi');
      }
    }
    const { is_main, ...rest } = dto;
    return { ...rest, ...(dto.phone_number ? { phone_number: normalizeUzPhone(dto.phone_number) } : {}) };
  }
}

@ApiTags('Account')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(UserGuard)
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}

  @Get()
  list(@GetCurrentUserId() userId: number) {
    return this.addresses.list(userId);
  }

  @Post()
  create(@GetCurrentUserId() userId: number, @Body() dto: AddressDto) {
    return this.addresses.create(userId, dto);
  }

  @Patch(':id')
  update(@GetCurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAddressDto) {
    return this.addresses.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@GetCurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.addresses.remove(userId, id);
  }
}

@Module({
  controllers: [AddressesController],
  providers: [AddressesService],
})
export class AccountModule {}
