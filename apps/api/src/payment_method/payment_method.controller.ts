import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PaymentMethodService } from './payment_method.service';
import { CreatePaymentMethodDto } from './dto/create-payment_method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment_method.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSelfGuard } from '../guards/admin-self.guard';
import { AdminGuard } from '../guards/admin.guard';
import { UserSelfGuard } from '../guards/user-self.guard';
import { UserGuard } from '../guards/user.guard';

@ApiTags('Payment Methods')
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly service: PaymentMethodService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi to‘lov usuli yaratish' })
  @ApiResponse({ status: 201, description: 'To‘lov usuli yaratildi' })
  @ApiResponse({ status: 400, description: 'Xato so‘rov maʼlumotlari' })
  create(@Body() dto: CreatePaymentMethodDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha to‘lov usullarini ko‘rish' })
  @ApiResponse({ status: 200, description: 'To‘lov usullari ro‘yxati' })
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard, AdminSelfGuard)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID orqali to‘lov usulini olish' })
  @ApiResponse({ status: 200, description: 'Topilgan to‘lov usuli' })
  @ApiResponse({ status: 404, description: 'To‘lov usuli topilmadi' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard, UserSelfGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'To‘lov usulini yangilash' })
  @ApiResponse({ status: 200, description: 'To‘lov usuli yangilandi' })
  @ApiResponse({ status: 400, description: 'Xato maʼlumot' })
  @ApiResponse({ status: 404, description: 'To‘lov usuli topilmadi' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard, UserSelfGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'To‘lov usulini o‘chirish' })
  @ApiResponse({ status: 200, description: 'To‘lov usuli o‘chirildi' })
  @ApiResponse({ status: 404, description: 'To‘lov usuli topilmadi' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard, UserSelfGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
