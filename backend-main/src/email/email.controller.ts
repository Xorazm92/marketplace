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
  NotFoundException,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AdminSelfGuard } from '../guards/admin-self.guard';
import { UserGuard } from '../guards/user.guard';
import { UserSelfGuard } from '../guards/user-self.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Emails')
@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new email' })
  @ApiResponse({ status: 201, description: 'Email successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  create(@Body() createEmailDto: CreateEmailDto) {
    return this.emailService.create(createEmailDto);
  }

  @Post('/byUser/:id')
  @ApiOperation({ summary: 'Create a new email' })
  @ApiResponse({ status: 201, description: 'Email successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  createByUser(
    @Body() createEmailDto: CreateEmailDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.emailService.createByUser(createEmailDto);
  }

  @Get('activate/:link')
  async activateEmail(@Param('link') link: string) {
    return this.emailService.verifyEmail(link)
  }

  @Get()
  @ApiOperation({ summary: 'Get all emails' })
  @ApiResponse({ status: 200, description: 'List of emails' })
  @ApiBearerAuth('inbola')
  @UseGuards(AdminGuard, AdminSelfGuard)
  findAll() {
    return this.emailService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an email by ID' })
  @ApiResponse({ status: 200, description: 'Email found' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard, UserSelfGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.emailService.findOne(id);
  }

  @Get('byUser/:id')
  @ApiOperation({ summary: 'Get emails of user by ID' })
  @ApiResponse({ status: 200, description: 'Email found' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard, UserSelfGuard)
  findEmailsByUser(@Param('id', ParseIntPipe) id: number) {
    return this.emailService.findEmailsByUser(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an email by ID' })
  @ApiResponse({ status: 200, description: 'Email updated' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard, UserSelfGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmailDto: UpdateEmailDto,
  ) {
    return this.emailService.update(id, updateEmailDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an email by ID' })
  @ApiResponse({ status: 200, description: 'Email deleted' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  @ApiBearerAuth('inbola')
  @UseGuards(UserGuard, UserSelfGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('emailId') emailId: number,
  ) {
    return this.emailService.remove(id, emailId);
  }
}
