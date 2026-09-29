import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UserGuard } from '../guards/user.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';
import { PaymeService } from './payme.service';
import { ClickRequest, ClickService } from './click.service';
import { enabledPaymentMethods } from './methods';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payme: PaymeService,
    private readonly click: ClickService,
    private readonly config: ConfigService,
  ) {}

  // Checkout faqat haqiqatan sozlangan usullarni ko'rsatadi.
  @Get('methods')
  methods() {
    return enabledPaymentMethods(this.config);
  }

  @Post('checkout/:orderId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  async checkout(@GetCurrentUserId() userId: number, @Param('orderId', ParseIntPipe) orderId: number) {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, user_id: userId } });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    if (order.status !== 'PENDING' || order.payment_status === 'PAID') {
      throw new BadRequestException("Bu buyurtmani to'lab bo'lmaydi");
    }
    const returnUrl = `${this.config.get('FRONTEND_URL')}/orders/${order.id}`;
    // Summa har doim buyurtmadan olinadi (Faza 0, C8).
    if (order.payment_method === 'PAYME' && this.payme.isEnabled) {
      return { payment_url: this.payme.checkoutUrl(order.id, order.final_amount, returnUrl) };
    }
    if (order.payment_method === 'CLICK' && this.click.isEnabled) {
      return { payment_url: this.click.checkoutUrl(order.id, order.final_amount, returnUrl) };
    }
    throw new BadRequestException("Bu buyurtma uchun onlayn to'lov mavjud emas");
  }

  // Provayder callback'lari: IP bo'yicha cheklanmaydi (provayder bitta IP'dan ko'p yuboradi),
  // himoya — imzo/Basic auth.
  @Post('payme')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  @ApiExcludeEndpoint()
  paymeCallback(@Body() body: unknown, @Headers('authorization') authorization?: string) {
    return this.payme.handle(body, authorization);
  }

  @Post('click/prepare')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  @ApiExcludeEndpoint()
  clickPrepare(@Body() body: ClickRequest) {
    return this.click.prepare(body);
  }

  @Post('click/complete')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  @ApiExcludeEndpoint()
  clickComplete(@Body() body: ClickRequest) {
    return this.click.complete(body);
  }
}
