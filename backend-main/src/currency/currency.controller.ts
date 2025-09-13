import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Currency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a new currency' })
  @ApiResponse({ status: 201, description: 'Currency created successfully' })
  create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currencyService.create(createCurrencyDto);
  }
  
  @Post('seed')
  @ApiOperation({ summary: 'Seed default currencies' })
  @ApiResponse({ status: 201, description: 'Currencies seeded successfully' })
  async seed() {
    try {
      // Check if currencies already exist
      const existingCurrencies = await this.currencyService.findAll();
      if (existingCurrencies.length > 0) {
        return { message: 'Currencies already exist' };
      }

      // Create default currencies
      const defaultCurrencies = [
        { name: 'O\'zbek so\'mi', code: 'UZS', symbol: 'so\'m' },
        { name: 'US Dollar', code: 'USD', symbol: '$' },
        { name: 'Euro', code: 'EUR', symbol: '€' },
        { name: 'Russian Ruble', code: 'RUB', symbol: '₽' }
      ];

      for (const currency of defaultCurrencies) {
        await this.currencyService.create(currency);
      }

      return { message: 'Currencies seeded successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to seed currencies');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all currencies' })
  @ApiResponse({ status: 200, description: 'List of currencies' })
  findAll() {
    return this.currencyService.findAll();
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get currency by ID' })
  @ApiResponse({ status: 200, description: 'Currency data found' })
  @ApiResponse({ status: 404, description: 'Currency not found' })
  findOne(@Param('id') id: string) {
    return this.currencyService.findOne(+id);
  }
  
  @Put(':id')
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update currency by ID' })
  @ApiResponse({ status: 200, description: 'Currency updated successfully' })
  update(@Param('id') id: string, @Body() updateCurrencyDto: UpdateCurrencyDto) {
    return this.currencyService.update(+id, updateCurrencyDto);
  }
  
  @Delete(':id')
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete currency by ID' })
  @ApiResponse({ status: 200, description: 'Currency deleted successfully' })
  remove(@Param('id') id: string) {
    return this.currencyService.remove(+id);
  }
}
