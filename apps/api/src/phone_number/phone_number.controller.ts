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
  Req,
  Query,
} from '@nestjs/common';

import { PhoneNumberService } from './phone_number.service';
import { CreatePhoneNumberDto } from './dto/create-phone_number.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone_number.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserGuard } from '../guards/user.guard';
import { AdminGuard } from '../guards/admin.guard';
import { Request } from 'express';
import { UserSelfGuard } from '../guards/user-self.guard';

@ApiTags('Phone Numbers')
@Controller('phone-number')
export class PhoneNumberController {
  constructor(private readonly phoneNumberService: PhoneNumberService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new phone number' })
  @ApiResponse({
    status: 201,
    description: 'Phone number successfully created',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  create(@Body() createPhoneNumberDto: CreatePhoneNumberDto) {
    return this.phoneNumberService.create(createPhoneNumberDto);
  }

  @Post('/byUser/:id')
  @ApiOperation({ summary: 'Create a new phone number' })
  @ApiResponse({
    status: 201,
    description: 'Phone number successfully created',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @UseGuards(UserGuard, UserSelfGuard)
  createByUser(
    @Body() createPhoneNumberDto: CreatePhoneNumberDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.phoneNumberService.create({
      ...createPhoneNumberDto,
      user_id: id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all phone numbers' })
  @ApiResponse({ status: 200, description: 'List of phone numbers' })
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard)
  findAll() {
    return this.phoneNumberService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a phone number by ID' })
  @ApiResponse({ status: 200, description: 'Phone number found' })
  @ApiResponse({ status: 404, description: 'Phone number not found' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard, UserSelfGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.phoneNumberService.findOne(id);
  }

  @Get('byUser/:id')
  @ApiOperation({ summary: 'Get phones number by ID' })
  @ApiResponse({ status: 200, description: 'Phone number found' })
  @ApiResponse({ status: 404, description: 'Phone number not found' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard, UserSelfGuard)
  findPhonesByUser(@Param('id', ParseIntPipe) id: number) {
    return this.phoneNumberService.findByUser(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a phone number by ID' })
  @ApiResponse({ status: 200, description: 'Phone number updated' })
  @ApiResponse({ status: 404, description: 'Phone number not found' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePhoneNumberDto: UpdatePhoneNumberDto,
  ) {
    return this.phoneNumberService.update(id, updatePhoneNumberDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a phone number by ID' })
  @ApiResponse({ status: 200, description: 'Phone number deleted' })
  @ApiResponse({ status: 404, description: 'Phone number not found' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard, UserSelfGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('phoneId') phoneId: number,
  ) {
    return this.phoneNumberService.remove(id, phoneId);
  }
}