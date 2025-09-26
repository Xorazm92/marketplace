# RBAC System Setup Guide - INBOLA Marketplace

## Overview
This guide provides step-by-step instructions to implement a comprehensive Role-Based Access Control (RBAC) system for the INBOLA marketplace, including Uzbekistan-specific KYC verification.

## Features Implemented

### 1. Role System
- **Guest**: Basic viewing permissions
- **Customer**: Shopping and profile management
- **Seller**: Product management and sales analytics
- **Moderator**: Content moderation
- **Admin**: Full system control

### 2. Permission System
- Fine-grained permissions for each role
- Resource-level access control
- Dynamic permission checking
- Permission inheritance

### 3. Uzbekistan KYC System
- Passport verification
- Business license validation
- Tax ID verification
- INN validation
- Multi-document upload support

### 4. Security Features
- JWT + Refresh token authentication
- Multi-device session management
- Account lockout mechanism
- Password policies
- Audit logging

## Setup Instructions

### Step 1: Database Migration

1. **Update Prisma Schema**:
```bash
# Add the RBAC schema to your existing schema.prisma
cat prisma/schema/rbac.prisma >> prisma/schema.prisma

# Generate and apply migration
npx prisma migrate dev --name add_rbac_system
```

2. **Seed Default Roles**:
```bash
# Create seed file
npx prisma db seed --preview-feature
```

### Step 2: Environment Configuration

Add to your `.env` file:
```bash
# RBAC Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d
REFRESH_TOKEN_EXPIRATION=30d

# KYC Configuration
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf

# Password Policy
PASSWORD_MIN_LENGTH=8
PASSWORD_MAX_AGE=90
LOCKOUT_ATTEMPTS=5
LOCKOUT_DURATION=30

# Uzbekistan Specific
UZ_PASSPORT_REGEX=^([A-Z]{2}\d{7}|\d{9})$
UZ_INN_REGEX=^\d{9}|\d{14}$
UZ_BUSINESS_LICENSE_REGEX=^\d{8}$
```

### Step 3: File Upload Configuration

Create upload directories:
```bash
mkdir -p uploads/kyc/personal
mkdir -p uploads/kyc/business
mkdir -p uploads/avatars
```

### Step 4: Initialize RBAC System

Create initialization script:

```typescript
// scripts/init-rbac.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RbacService } from '../src/rbac/services/rbac.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const rbacService = app.get(RbacService);
  
  // Initialize default roles and permissions
  await rbacService.initializeDefaultRoles();
  
  console.log('RBAC system initialized successfully');
  await app.close();
}

bootstrap();
```

### Step 5: Frontend Integration

Install required dependencies:
```bash
npm install @tabler/icons-react react-dropzone
```

## API Endpoints

### Role Management
- `GET /rbac/roles` - Get all roles
- `POST /rbac/roles` - Create new role (Admin)
- `PUT /rbac/roles/:name` - Update role (Admin)
- `DELETE /rbac/roles/:name` - Delete role (Admin)

### User Management
- `POST /rbac/users/:userId/roles` - Assign role to user (Admin)
- `GET /rbac/users/:userId/permissions` - Get user permissions
- `GET /rbac/users/:userId/roles` - Get user roles

### KYC Verification
- `POST /rbac/kyc/personal` - Submit personal KYC
- `POST /rbac/kyc/business` - Submit business KYC
- `GET /rbac/kyc/status` - Get KYC status
- `GET /rbac/kyc/verifications` - Get all verifications (Moderator+)
- `POST /rbac/kyc/:id/approve` - Approve KYC (Moderator+)
- `POST /rbac/kyc/:id/reject` - Reject KYC (Moderator+)

### Security
- `GET /rbac/sessions` - Get active sessions
- `DELETE /rbac/sessions/:id` - Revoke session
- `GET /rbac/audit-logs` - Get audit logs (Admin)

## Usage Examples

### 1. Protecting Routes

```typescript
// Backend - Controller
@Controller('products')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ProductsController {
  @Get()
  @RequirePermissions(Permission.VIEW_PRODUCTS)
  async getProducts() {
    return this.productsService.findAll();
  }

  @Post()
  @RequirePermissions(Permission.MANAGE_PRODUCTS)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }
}
```

### 2. Frontend Permission Checking

```typescript
// Frontend - Component
import { PermissionWrapper } from '@/services/rbac';

function AdminPanel() {
  return (
    <PermissionWrapper permission="manage_users">
      <AdminDashboard />
    </PermissionWrapper>
  );
}
```

### 3. KYC Verification

```typescript
// Personal KYC submission
const submitPersonalKyc = async (formData: FormData) => {
  const response = await rbacApi.submitPersonalKyc(formData);
  return response;
};

// Business KYC submission
const submitBusinessKyc = async (formData: FormData) => {
  const response = await rbacApi.submitBusinessKyc(formData);
  return response;
};
```

## Uzbekistan Specific Features

### 1. Passport Validation
- Format: AA1234567 or 123456789
- Automatic validation before submission
- Photo quality checks

### 2. Business License
- Must be 8 digits
- Validated against government database
- Tax certificate verification

### 3. INN Verification
- 9 or 14 digit format
- Real-time validation
- Tax registration status check

## Security Best Practices

### 1. Session Management
- 30-day token expiration
- Device tracking
- IP address logging
- Automatic logout on suspicious activity

### 2. Password Policies
- Minimum 8 characters
- Uppercase, lowercase, numbers, special characters
- 90-day password expiration
- Account lockout after 5 failed attempts

### 3. Audit Logging
- All user actions logged
- IP address tracking
- User agent logging
- Failed attempt monitoring

## Testing

### 1. Unit Tests
```bash
npm run test:unit rbac
```

### 2. Integration Tests
```bash
npm run test:e2e rbac
```

### 3. Security Tests
```bash
npm run test:security rbac
```

## Monitoring

### 1. Security Monitoring
- Failed login attempts
- Suspicious activity alerts
- KYC verification monitoring
- Session anomalies

### 2. Performance Monitoring
- API response times
- Database query performance
- File upload monitoring
- Cache hit rates

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check user role and permissions
2. **File Upload Failed**: Verify file size and type restrictions
3. **KYC Rejected**: Check rejection reason and resubmit
4. **Session Expired**: Refresh token or re-authenticate

### Debug Commands

```bash
# Check permissions for user
npx prisma user findUnique --where "{email: 'user@example.com'}" --include role

# View audit logs
npx prisma auditLog findMany --orderBy "{timestamp: desc}" --take 10

# Check KYC status
npx prisma kycVerification findMany --where "{userId: 'user-id'}"
```

## Support

For technical support or questions about the RBAC system:
- Check the documentation
- Review audit logs
- Test with different user roles
- Validate KYC documents

## Next Steps

1. **Deploy to production**
2. **Train administrators** on the new system
3. **Monitor usage patterns**
4. **Gather user feedback**
5. **Plan for role expansion**

The RBAC system is now ready for production use with full Uzbekistan compliance and security features.
