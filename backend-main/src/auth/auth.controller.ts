import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiTags, 
  ApiResponse, 
  ApiBody, 
  ApiCookieAuth,
  ApiConsumes,
  ApiProduces,
  ApiHeader,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiGoneResponse,
  ApiProperty,
} from "@nestjs/swagger";
import { Response } from "express";
import { ResponseFields } from "../types";
import { CookieGetter } from "../decorators/cookie-getter.decorator";
import { AdminSignInDto, CreateAdminDto } from "../admin/dto";
import { AdminGuard } from "../guards/admin.guard";
import { SuperAdminGuard } from "../guards/superAdmin.guard";

// Response DTOs for Swagger documentation
class AdminSignUpResponse {
  @ApiProperty({ example: true })
  success: boolean;
  
  @ApiProperty({ example: 'Admin created successfully' })
  message: string;
  
  @ApiProperty({
    example: {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    }
  })
  data: {
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

class AdminSignInResponse {
  @ApiProperty({ example: true })
  success: boolean;
  
  @ApiProperty({ example: 'Login successful' })
  message: string;
  
  @ApiProperty({
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    }
  })
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      username: string;
      email: string;
      role: string;
    };
  };
}

class ErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;
  
  @ApiProperty({ example: 400 })
  statusCode: number;
  
  @ApiProperty({ 
    oneOf: [
      { type: 'string', example: 'Error message' },
      { type: 'array', items: { type: 'string' }, example: ['Error 1', 'Error 2'] }
    ]
  })
  message: string | string[];
  
  @ApiProperty({ example: 'Bad Request' })
  error: string;
  
  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  timestamp: string;
  
  @ApiProperty({ example: '/api/v1/auth/admin/sign-up' })
  path: string;
}

@ApiTags('🔐 Authentication')
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("admin/sign-up")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: "Register a new admin",
    description: "Create a new admin user. Requires super admin privileges.\n\n" +
    "### Required Permissions\n" +
    "- User must be authenticated\n" +
    "- User must have SUPER_ADMIN role\n\n" +
    "### Request Validation\n" +
    "- Username must be 3-30 characters long\n" +
    "- Email must be a valid email address\n" +
    "- Password must be at least 8 characters long\n" +
    "- Password must contain at least one uppercase letter, one lowercase letter, one number and one special character\n" +
    "- Password and confirmPassword must match\n"
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AdminGuard, SuperAdminGuard)
  @ApiCreatedResponse({ 
    description: 'Admin created successfully',
    type: AdminSignUpResponse
  })
  @ApiBadRequestResponse({ 
    description: 'Bad request - Validation failed',
    type: ErrorResponse
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - Authentication required',
    type: ErrorResponse
  })
  @ApiForbiddenResponse({ 
    description: 'Forbidden - Requires super admin role',
    type: ErrorResponse
  })
  @ApiBody({ 
    type: CreateAdminDto,
    description: 'Admin registration details',
    examples: {
      admin: {
        summary: 'Create Admin (ADMIN role)',
        value: {
          username: 'admin',
          email: 'admin@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          role: 'ADMIN',
          phone_number: '+998901234567',
          first_name: 'Admin',
          last_name: 'User'
        }
      },
      superAdmin: {
        summary: 'Create Super Admin (SUPER_ADMIN role)',
        value: {
          username: 'superadmin',
          email: 'superadmin@example.com',
          password: 'SuperSecure123!',
          confirmPassword: 'SuperSecure123!',
          role: 'SUPER_ADMIN',
          phone_number: '+998907654321',
          first_name: 'Super',
          last_name: 'Admin'
        }
      }
    }
  })
  async signUpAdmin(@Body() createAdminDto: CreateAdminDto) {    
    return this.authService.adminSignUp(createAdminDto);
  }

  @Post('admin/sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Admin login',
    description: 'Authenticate admin with email and password to get access and refresh tokens.\n\n' +
    '### Authentication Flow\n' +
    '1. Submit email and password\n' +
    '2. Server validates credentials\n' +
    '3. Returns JWT tokens and user info\n\n' +
    '### Token Usage\n' +
    '- **Access Token**: Include in `Authorization: Bearer <token>` header for protected routes\n' +
    '- **Refresh Token**: Used to get new access token when expired\n\n' +
    '### Security\n' +
    '- Tokens expire after 1 hour (configurable)\n' +
    '- Passwords are hashed using bcrypt\n' +
    '- Rate limiting is applied to prevent brute force attacks'
  })
  @ApiOkResponse({ 
    description: 'Login successful',
    type: AdminSignInResponse
  })
  @ApiBadRequestResponse({
    description: 'Invalid request format',
    type: ErrorResponse,
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: [
            'email must be an email',
            'password must be a string'
          ],
          error: 'Bad Request',
          timestamp: '2023-01-01T00:00:00.000Z',
          path: '/api/v1/auth/admin/sign-in'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: ErrorResponse,
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Invalid credentials',
          error: 'Unauthorized',
          timestamp: '2023-01-01T00:00:00.000Z',
          path: '/api/v1/auth/admin/sign-in'
        }
      }
    }
  })
  @ApiBody({
    description: 'Admin login credentials',
    examples: {
      admin: {
        summary: 'Admin Login Example',
        value: {
          email: 'admin@example.com',
          password: 'SecurePass123!'
        }
      },
      superAdmin: {
        summary: 'Super Admin Login Example',
        value: {
          email: 'superadmin@example.com',
          password: 'SuperSecure123!'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        message: 'Login successful',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: 'ADMIN'
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized'
      }
    }
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { 
          type: 'string', 
          example: 'admin@example.com',
          description: 'Admin email address'
        },
        password: { 
          type: 'string', 
          example: 'yourpassword123',
          description: 'Admin password'
        }
      },
      required: ['email', 'password']
    }
  })
  async adminSignIn(
    @Body() adminSignInDto: AdminSignInDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<ResponseFields> {
    return this.authService.adminSignIn(adminSignInDto, res);
  }

  @Get('admin/sign-out')
  @ApiOperation({ 
    summary: 'Admin logout',
    description: 'Invalidate the current session and clear cookies'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    schema: {
      example: {
        success: true,
        message: 'Logged out successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Admin access required',
    type: ErrorResponse
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT access token',
    required: true,
    example: 'Bearer your.jwt.token.here'
  })
  async signOutAdmin(
    @CookieGetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.AdminSignOut(refreshToken, res);
  }

  @Get('admin/:id/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refresh admin token',
    description: 'Get a new access token using a valid refresh token.\n\n' +
    '### How It Works\n' +
    '1. Client sends the refresh token from cookies\n' +
    '2. Server verifies the refresh token\n' +
    '3. If valid, issues new access and refresh tokens\n\n' +
    '### Security Notes\n' +
    '- Refresh tokens should be stored in HTTP-only cookies\n' +
    '- Access tokens have a short expiry (e.g., 15 minutes)\n' +
    '- Refresh tokens have a longer expiry (e.g., 7 days)'
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AdminGuard)
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Admin user ID',
    example: 1
  })
  @ApiOkResponse({
    description: 'Token refresh successful',
    schema: {
      example: {
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          accessToken: 'new.jwt.access.token.here',
          refreshToken: 'new.refresh.token.here'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
    type: ErrorResponse
  })
  @ApiForbiddenResponse({
    description: 'Access denied',
    type: ErrorResponse
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Current access token (Bearer token)',
    required: true,
    example: 'Bearer your.jwt.token.here'
  })
  async refreshAdminToken(
    @Param('id') id: number,
    @CookieGetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.AdminRefreshToken(+id, refreshToken, res);
  }

  @Get('admin/activate/:link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Activate admin account',
    description: 'Activate an admin account using the activation link sent to their email.\n\n' +
    '### How It Works\n' +
    '1. User clicks the activation link in their email\n' +
    '2. Backend verifies the activation link\n' +
    '3. If valid, the admin account is activated\n\n' +
    '### Security Notes\n' +
    '- Activation links should be single-use\n' +
    '- Links should expire after a certain period (e.g., 24 hours)\n' +
    '- Only unactivated accounts can be activated'
  })
  @ApiParam({
    name: 'link',
    description: 'Activation link sent to admin email',
    example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8'
  })
  @ApiResponse({
    status: 200,
    description: 'Account activated successfully',
    schema: {
      example: {
        success: true,
        message: 'Admin account activated successfully',
        data: {
          id: 1,
          username: 'activated_admin',
          email: 'admin@example.com',
          is_active: true,
          role: 'ADMIN'
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired activation link',
    type: ErrorResponse
  })
  @ApiNotFoundResponse({
    description: 'Admin not found',
    type: ErrorResponse
  })
  @ApiGoneResponse({
    description: 'Account already activated',
    type: ErrorResponse
  })
  async activateAdmin(@Param('link') link: string) {
    return this.authService.activateAdmin(link);
  }
  
}
