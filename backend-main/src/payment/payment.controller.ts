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
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminSelfGuard } from '../guards/admin-self.guard';
import { AdminGuard } from '../guards/admin.guard';
import { UserGuard } from '../guards/user.guard';
import { UserSelfGuard } from '../guards/user-self.guard';
import { ClickService } from './services/click.service';
import { PaymeService } from './services/payme.service';

@ApiTags('Payments')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly clickService: ClickService,
    private readonly paymeService: PaymeService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard, AdminSelfGuard)
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard, UserSelfGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment updated' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard, UserSelfGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment deleted' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard, UserSelfGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.remove(id);
  }

  // Click Payment endpoints
  @Post('click/create')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Create Click payment' })
  async createClickPayment(@Body() paymentData: {
    order_id: number;
    amount: number;
    return_url?: string;
    description?: string;
  }) {
    return this.clickService.createPayment(paymentData);
  }

  @Post('click/callback')
  @ApiOperation({ summary: 'Click payment callback' })
  async clickCallback(@Body() callbackData: any) {
    return this.clickService.handleCallback(callbackData);
  }

  @Get('click/verify')
  @ApiOperation({ summary: 'Verify Click payment' })
  async verifyClickPayment(
    @Query('payment_id') paymentId: string,
    @Query('status') status: string,
  ) {
    return this.clickService.verifyPayment(paymentId, status);
  }

  // Payme Payment endpoints
  @Post('payme/create')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Create Payme payment' })
  async createPaymePayment(@Body() paymentData: {
    order_id: number;
    amount: number;
    return_url?: string;
    description?: string;
  }) {
    return this.paymeService.createPayment(paymentData);
  }

  @Post('payme/callback')
  @ApiOperation({ summary: 'Payme payment callback' })
  async paymeCallback(@Body() callbackData: any) {
    return this.paymeService.handleCallback(callbackData);
  }

  @Get('payme/verify')
  @ApiOperation({ summary: 'Verify Payme payment' })
  async verifyPaymePayment(
    @Query('payment_id') paymentId: string,
    @Query('status') status: string,
  ) {
    return this.paymeService.verifyPayment(paymentId, status);
  }
}
