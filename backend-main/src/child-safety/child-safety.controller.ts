import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ChildSafetyService } from './child-safety.service';
import { UserGuard } from '../guards/user.guard';
import { AdminGuard } from '../guards/admin.guard';
import { GetCurrentUserId } from '../decorators/get-current-user-id.decorator';

@ApiTags('🛡️ Child Safety')
@Controller('child-safety')
export class ChildSafetyController {
  constructor(private readonly childSafetyService: ChildSafetyService) {}

  @Get('age-groups')
  @ApiOperation({ summary: 'Get all age groups' })
  @ApiResponse({ status: 200, description: 'Age groups retrieved successfully' })
  async getAgeGroups() {
    return this.childSafetyService.getAgeGroups();
  }

  @Get('safety-certifications')
  @ApiOperation({ summary: 'Get all safety certifications' })
  @ApiResponse({ status: 200, description: 'Safety certifications retrieved successfully' })
  async getSafetyCertifications() {
    return this.childSafetyService.getSafetyCertifications();
  }

  @Post('check-content')
  @ApiOperation({ summary: 'Check content safety for children' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        userAge: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Content safety check completed' })
  async checkContentSafety(
    @Body() checkData: {
      title: string;
      description: string;
      category: string;
      tags: string[];
      userAge?: number;
    }
  ) {
    return this.childSafetyService.checkContentSafety(
      checkData.title,
      checkData.description,
      checkData.category,
      checkData.tags
    );
  }

  @Get('child-profiles')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get child profiles for current user' })
  @ApiResponse({ status: 200, description: 'Child profiles retrieved successfully' })
  async getChildProfiles(@GetCurrentUserId() userId: number) {
    return this.childSafetyService.getChildProfiles(userId);
  }

  @Post('child-profiles')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create child profile' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        birth_date: { type: 'string', format: 'date' },
        gender: { type: 'string' },
        interests: { type: 'array', items: { type: 'string' } },
        allergies: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Child profile created successfully' })
  async createChildProfile(
    @GetCurrentUserId() userId: number,
    @Body() profileData: {
      name: string;
      birth_date: string;
      gender?: string;
      interests?: string[];
      allergies?: string[];
    }
  ) {
    return this.childSafetyService.createChildProfile(userId, profileData);
  }

  @Get('parental-controls/:childId')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get parental controls for child' })
  @ApiParam({ name: 'childId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Parental controls retrieved successfully' })
  async getParentalControls(
    @GetCurrentUserId() userId: number,
    @Param('childId', ParseIntPipe) childId: number
  ) {
    return this.childSafetyService.getParentalControls(userId, childId);
  }

  @Put('parental-controls/:childId')
  @UseGuards(UserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update parental controls for child' })
  @ApiParam({ name: 'childId', type: 'number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        spending_limit: { type: 'number' },
        daily_spending_limit: { type: 'number' },
        allowed_categories: { type: 'array', items: { type: 'string' } },
        blocked_categories: { type: 'array', items: { type: 'string' } },
        time_restrictions: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Parental controls updated successfully' })
  async updateParentalControls(
    @GetCurrentUserId() userId: number,
    @Param('childId', ParseIntPipe) childId: number,
    @Body() controlData: {
      spending_limit?: number;
      daily_spending_limit?: number;
      allowed_categories?: string[];
      blocked_categories?: string[];
      time_restrictions?: any;
    }
  ) {
    return this.childSafetyService.updateParentalControls(userId, childId, controlData);
  }

  @Get('products/age-appropriate')
  @ApiOperation({ summary: 'Get age-appropriate products' })
  @ApiQuery({ name: 'age', type: 'number', required: true })
  @ApiQuery({ name: 'category', type: 'string', required: false })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({ status: 200, description: 'Age-appropriate products retrieved successfully' })
  async getAgeAppropriateProducts(
    @Query('age', ParseIntPipe) age: number,
    @Query('category') category?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.childSafetyService.getAgeAppropriateProducts(age, category, page, limit);
  }

  // Admin endpoints
  @Get('admin/safety-reports')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get safety reports (Admin only)' })
  @ApiResponse({ status: 200, description: 'Safety reports retrieved successfully' })
  async getSafetyReports() {
    return this.childSafetyService.getSafetyReports();
  }

  @Post('admin/safety-certifications')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create safety certification (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        code: { type: 'string' },
        description: { type: 'string' },
        required_for_age: { type: 'string' },
        logo: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Safety certification created successfully' })
  async createSafetyCertification(
    @Body() certificationData: {
      name: string;
      code: string;
      description?: string;
      required_for_age?: string;
      logo?: string;
    }
  ) {
    return this.childSafetyService.createSafetyCertification(certificationData);
  }
}