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
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AdminSelfGuard } from '../guards/admin-self.guard';
import { AdminGuard } from '../guards/admin.guard';
import { UserGuard } from '../guards/user.guard';
import { UserSelfGuard } from '../guards/user-self.guard';
import { ClickService } from './services/click.service';
import { PaymeService } from './services/payme.service';
import { UzumService } from './services/uzum.service';

@ApiTags('💳 Payments')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly clickService: ClickService,
    private readonly paymeService: PaymeService,
    private readonly uzumService: UzumService,
  ) {}

  @Post()
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @UseGuards(AdminGuard, AdminSelfGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all payments' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.paymentService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  @UseGuards(UserGuard, UserSelfGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(UserGuard, UserSelfGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment updated' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @UseGuards(UserGuard, UserSelfGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment deleted' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.remove(id);
  }

  // Process payment for order
  @Post('process/:orderId')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Process payment for order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async processPayment(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() paymentData: {
      method: 'CARD' | 'CLICK' | 'PAYME' | 'UZUM' | 'CASH_ON_DELIVERY';
      returnUrl?: string;
      cancelUrl?: string;
      description?: string;
      cardDetails?: {
        cardNumber?: string;
        expiryMonth?: string;
        expiryYear?: string;
        cvv?: string;
        cardHolderName?: string;
      };
    },
  ) {
    return this.paymentService.processPayment(orderId, paymentData);
  }

  // Get payment status for order
  @Get('status/:orderId')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment status for order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  getPaymentStatus(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentService.getPaymentStatus(orderId);
  }

  // Refund payment
  @Post('refund/:paymentId')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Refund payment (Admin only)' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  refundPayment(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() refundData: { amount?: number },
  ) {
    return this.paymentService.refundPayment(paymentId, refundData.amount);
  }

  // Get payment statistics
  @Get('admin/statistics')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment statistics (Admin only)' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date (ISO string)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getPaymentStatistics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const fromDate = dateFrom ? new Date(dateFrom) : undefined;
    const toDate = dateTo ? new Date(dateTo) : undefined;
    return this.paymentService.getPaymentStatistics(fromDate, toDate);
  }


  // =============================================================================
  // CLICK PAYMENT GATEWAY
  // =============================================================================

  @Post('click/create')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Click payment', description: 'Initialize payment through Click gateway' })
  @ApiResponse({ status: 200, description: 'Click payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createClickPayment(@Body() paymentData: {
    order_id: number;
    amount: number;
    return_url?: string;
    description?: string;
  }) {
    try {
      return await this.clickService.createPayment(paymentData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('click/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Click payment callback', description: 'Handle Click payment webhook' })
  @ApiResponse({ status: 200, description: 'Callback processed successfully' })
  async clickCallback(@Body() callbackData: any) {
    try {
      return await this.clickService.handleCallback(callbackData);
    } catch (error) {
      this.logger.error('Click callback error:', error);
      return { error: -6, error_note: 'Internal server error' };
    }
  }

  @Get('click/verify')
  @ApiOperation({ summary: 'Verify Click payment', description: 'Manually verify Click payment status' })
  @ApiQuery({ name: 'payment_id', description: 'Payment ID' })
  @ApiQuery({ name: 'status', description: 'Payment status' })
  @ApiResponse({ status: 200, description: 'Payment verification completed' })
  async verifyClickPayment(
    @Query('payment_id') paymentId: string,
    @Query('status') status: string,
  ) {
    if (!paymentId || !status) {
      throw new BadRequestException('payment_id and status are required');
    }
    return await this.clickService.verifyPayment(paymentId, status);
  }

  @Post('click/refund')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Process Click refund (Admin only)' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  async processClickRefund(@Body() refundData: {
    transaction_id: string;
    amount: number;
  }) {
    return await this.clickService.processRefund(refundData.transaction_id, refundData.amount);
  }

  // =============================================================================
  // PAYME PAYMENT GATEWAY
  // =============================================================================

  @Post('payme/create')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Payme payment', description: 'Initialize payment through Payme gateway' })
  @ApiResponse({ status: 200, description: 'Payme payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createPaymePayment(@Body() paymentData: {
    order_id: number;
    amount: number;
    return_url?: string;
    description?: string;
  }) {
    try {
      return await this.paymeService.createPayment(paymentData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('payme/callback')
  @Post('payme') // Alternative endpoint for Payme
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Payme payment callback', description: 'Handle Payme JSON-RPC webhook' })
  @ApiResponse({ status: 200, description: 'Callback processed successfully' })
  async paymeCallback(@Body() callbackData: any) {
    try {
      return await this.paymeService.handleCallback(callbackData);
    } catch (error) {
      this.logger.error('Payme callback error:', error);
      return {
        error: {
          code: -32400,
          message: 'Bad Request'
        }
      };
    }
  }

  @Get('payme/verify')
  @ApiOperation({ summary: 'Verify Payme payment', description: 'Manually verify Payme payment status' })
  @ApiQuery({ name: 'payment_id', description: 'Payment ID' })
  @ApiQuery({ name: 'status', description: 'Payment status' })
  @ApiResponse({ status: 200, description: 'Payment verification completed' })
  async verifyPaymePayment(
    @Query('payment_id') paymentId: string,
    @Query('status') status: string,
  ) {
    if (!paymentId || !status) {
      throw new BadRequestException('payment_id and status are required');
    }
    return await this.paymeService.verifyPayment(paymentId, status);
  }

  @Get('payme/status/:paymentId')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check Payme payment status' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved' })
  async checkPaymeStatus(@Param('paymentId') paymentId: string) {
    return await this.paymeService.checkPaymentStatus(paymentId);
  }

  @Post('payme/refund')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Process Payme refund (Admin only)' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  async processPaymeRefund(@Body() refundData: {
    transaction_id: string;
    amount: number;
  }) {
    return await this.paymeService.processRefund(refundData.transaction_id, refundData.amount);
  }

  // =============================================================================
  // UZUM PAYMENT GATEWAY
  // =============================================================================

  @Post('uzum/create')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Uzum payment', description: 'Initialize payment through Uzum gateway' })
  @ApiResponse({ status: 200, description: 'Uzum payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createUzumPayment(@Body() paymentData: {
    order_id: number;
    amount: number;
    return_url?: string;
    cancel_url?: string;
    description?: string;
  }) {
    try {
      return await this.uzumService.createPayment(paymentData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('uzum/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Uzum payment callback', description: 'Handle Uzum payment webhook' })
  @ApiResponse({ status: 200, description: 'Callback processed successfully' })
  async uzumCallback(@Body() callbackData: any) {
    try {
      return await this.uzumService.handleCallback(callbackData);
    } catch (error) {
      this.logger.error('Uzum callback error:', error);
      return {
        success: false,
        message: 'Callback processing failed',
        error: error.message
      };
    }
  }

  @Get('uzum/verify')
  @ApiOperation({ summary: 'Verify Uzum payment', description: 'Manually verify Uzum payment status' })
  @ApiQuery({ name: 'payment_id', description: 'Payment ID' })
  @ApiQuery({ name: 'status', description: 'Payment status' })
  @ApiResponse({ status: 200, description: 'Payment verification completed' })
  async verifyUzumPayment(
    @Query('payment_id') paymentId: string,
    @Query('status') status: string,
  ) {
    if (!paymentId || !status) {
      throw new BadRequestException('payment_id and status are required');
    }
    return await this.uzumService.verifyPayment(paymentId, status);
  }

  @Get('uzum/status/:paymentId')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check Uzum payment status' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved' })
  async checkUzumStatus(@Param('paymentId') paymentId: string) {
    return await this.uzumService.checkPaymentStatus(paymentId);
  }

  @Post('uzum/refund')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Process Uzum refund (Admin only)' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  async processUzumRefund(@Body() refundData: {
    transaction_id: string;
    amount: number;
  }) {
    return await this.uzumService.processRefund(refundData.transaction_id, refundData.amount);
  }

  // =============================================================================
  // PAYMENT HISTORY & USER ENDPOINTS
  // =============================================================================

  @Get('history/:userId')
  @UseGuards(UserSelfGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved successfully' })
  getUserPaymentHistory(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.paymentService.getPaymentHistory(userId, pageNum, limitNum);
  }

  // =============================================================================
  // WEBHOOK ENDPOINTS (Public - no auth required)
  // =============================================================================

  @Post('webhooks/click')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Click webhook endpoint' })
  async clickWebhook(@Body() webhookData: any) {
    return await this.paymentService.handleClickWebhook(webhookData);
  }

  @Post('webhooks/payme')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Payme webhook endpoint' })
  async paymeWebhook(@Body() webhookData: any) {
    return await this.paymentService.handlePaymeWebhook(webhookData);
  }

  @Post('webhooks/uzum')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Uzum webhook endpoint' })
  async uzumWebhook(@Body() webhookData: any) {
    return await this.paymentService.handleUzumWebhook(webhookData);
  }

  // Add logger property
  private readonly logger = new (require('@nestjs/common').Logger)(PaymentController.name);
}
