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
  Query,
  Req,
  Headers,
  RawBodyRequest,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, PaymentWebhookDto } from './dto/create-payment.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { UserGuard } from '../guards/user.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';
import { PayPalService } from './services/paypal.service';
import { StripeService } from './services/stripe.service';

@ApiTags('Payments')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paypalService: PayPalService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('initiate')
  @UseGuards(UserGuard)
  @ApiBearerAuth('inbola')
  @ApiOperation({ summary: 'Initiate payment for an order' })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  initiatePayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @GetCurrentUserId() userId: number,
  ) {
    return this.paymentService.initiatePayment(createPaymentDto, userId);
  }

  @Post(':id/confirm')
  @UseGuards(UserGuard)
  @ApiBearerAuth('inbola')
  @ApiOperation({ summary: 'Confirm payment after gateway processing' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  confirmPayment(
    @Param('id', ParseIntPipe) paymentId: number,
    @Body() gatewayData: any,
  ) {
    return this.paymentService.confirmPayment(paymentId, gatewayData);
  }

  @Get('admin/all')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('inbola')
  @ApiOperation({ summary: 'Get all payments (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.paymentService.findAll(+page, +limit);
  }

  @Get('admin/stats')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('inbola')
  @ApiOperation({ summary: 'Get payment statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment statistics' })
  getPaymentStats() {
    return this.paymentService.getPaymentStats();
  }

  @Get('history')
  @UseGuards(UserGuard)
  @ApiBearerAuth('inbola')
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved' })
  getPaymentHistory(
    @GetCurrentUserId() userId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.paymentService.getPaymentHistory(userId, +page, +limit);
  }

  @Get(':id')
  @UseGuards(UserGuard)
  @ApiBearerAuth('inbola')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(id);
  }

  @Post(':id/refund')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('inbola')
  @ApiOperation({ summary: 'Refund payment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  refundPayment(
    @Param('id', ParseIntPipe) paymentId: number,
    @Body() refundData: { amount?: number },
  ) {
    return this.paymentService.refundPayment(paymentId, refundData.amount);
  }

  // PayPal webhook
  @Post('webhook/paypal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PayPal webhook endpoint' })
  async paypalWebhook(
    @Headers() headers: any,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const body = req.rawBody.toString();
    const isValid = await this.paypalService.verifyWebhookSignature(headers, body);
    
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const webhookData = JSON.parse(body);
    const webhookDto: PaymentWebhookDto = {
      transaction_id: webhookData.resource?.id || webhookData.id,
      status: webhookData.event_type?.includes('COMPLETED') ? 'completed' : 'failed',
      amount: webhookData.resource?.amount?.total || 0,
      gateway_data: webhookData,
    };

    return this.paymentService.handleWebhook(webhookDto, 'PAYPAL');
  }

  // Stripe webhook
  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const event = await this.stripeService.handleWebhook(req.rawBody, signature);
    
    const webhookDto: PaymentWebhookDto = {
      transaction_id: (event.data.object as any).id,
      status: event.type.includes('succeeded') ? 'succeeded' : 'failed',
      amount: ((event.data.object as any).amount || 0) / 100, // Convert from cents
      gateway_data: event,
    };

    return this.paymentService.handleWebhook(webhookDto, 'STRIPE');
  }

  // Local payment methods webhooks (Click, Payme, UzCard)
  @Post('webhook/local/:method')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Local payment methods webhook' })
  async localPaymentWebhook(
    @Param('method') method: string,
    @Body() webhookData: any,
  ) {
    const webhookDto: PaymentWebhookDto = {
      transaction_id: webhookData.transaction_id || webhookData.id,
      status: webhookData.status || 'completed',
      amount: webhookData.amount || 0,
      gateway_data: webhookData,
    };

    return this.paymentService.handleWebhook(webhookDto, method.toUpperCase());
  }
}
