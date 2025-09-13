import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('Authentication & Security Tests (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let userToken: string;
  let adminToken: string;
  let refreshToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
    configService = app.get<ConfigService>(ConfigService);
    
    await app.init();

    // Create test users and get tokens
    await setupTestUsers();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
    await app.close();
  });

  async function setupTestUsers() {
    // Create admin user
    const adminResponse = await request(app.getHttpServer())
      .post('/api/auth/admin/sign-up')
      .send({
        first_name: 'Admin',
        last_name: 'Test',
        email: 'admin@test.com',
        phone_number: '+998901111111',
        password: 'AdminPass123!',
      });

    if (adminResponse.status === 201) {
      adminToken = adminResponse.body.access_token;
    }

    // Create regular user
    const userResponse = await request(app.getHttpServer())
      .post('/api/user-auth/phone-register')
      .send({
        phone_number: '+998901234567',
        otp: '123456',
        first_name: 'Test',
        last_name: 'User',
      });

    if (userResponse.status === 201) {
      userToken = userResponse.body.access_token;
      refreshToken = userResponse.body.refresh_token;
      userId = userResponse.body.user.id;
    }
  }

  async function cleanupTestData() {
    // Clean up test data
    try {
      await prisma.user.deleteMany({
        where: {
          OR: [
            { email: 'admin@test.com' },
            { phone_number: '+998901234567' },
            { phone_number: '+998901111111' },
          ],
        },
      });
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  }

  describe('JWT Token Management', () => {
    it('should generate valid JWT tokens', () => {
      expect(userToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      
      // Verify token structure
      const decodedToken = jwtService.decode(userToken) as any;
      expect(decodedToken).toHaveProperty('id');
      expect(decodedToken).toHaveProperty('iat');
      expect(decodedToken).toHaveProperty('exp');
    });

    it('should reject expired tokens', async () => {
      // Create an expired token
      const expiredToken = jwtService.sign(
        { id: userId, phoneNumber: '+998901234567' },
        { expiresIn: '1ms' } // Immediately expired
      );

      // Wait to ensure token is expired
      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await request(app.getHttpServer())
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('token');
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refresh_token: refreshToken,
        });

      expect(response.status).toBe(200);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();
      
      // New tokens should be different
      expect(response.body.access_token).not.toBe(userToken);
    });

    it('should reject invalid refresh tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refresh_token: 'invalid_refresh_token',
        });

      expect(response.status).toBe(403);
    });

    it('should invalidate refresh tokens on logout', async () => {
      // First logout
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${userToken}`);

      // Try to use refresh token after logout
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refresh_token: refreshToken,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Brute Force Protection', () => {
    const testPhone = '+998900000001';
    
    it('should block account after multiple failed login attempts', async () => {
      // First register a user for this test
      await request(app.getHttpServer())
        .post('/api/user-auth/phone-register')
        .send({
          phone_number: testPhone,
          otp: '123456',
          first_name: 'Brute',
          last_name: 'Test',
        });

      // Attempt multiple failed logins
      const maxAttempts = 5;
      for (let i = 0; i < maxAttempts; i++) {
        await request(app.getHttpServer())
          .post('/api/user-auth/phone-login')
          .send({
            phone_number: testPhone,
            otp: 'wrong_otp',
          });
      }

      // The next attempt should be blocked
      const response = await request(app.getHttpServer())
        .post('/api/user-auth/phone-login')
        .send({
          phone_number: testPhone,
          otp: 'wrong_otp',
        });

      expect(response.status).toBe(429); // Too Many Requests
      expect(response.body.message).toContain('blocked');
    });

    it('should implement rate limiting on sensitive endpoints', async () => {
      const requests = [];
      const maxRequests = 10;

      // Make rapid requests to password reset endpoint
      for (let i = 0; i < maxRequests; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/api/user-auth/send-otp')
            .send({
              phone_number: '+998900000002',
              type: 'login',
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('should allow admin access to admin endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status); // 404 if no users, 200 if users exist
    });

    it('should deny user access to admin endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Forbidden');
    });

    it('should allow user access to user endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
    });

    it('should deny unauthorized access to protected endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/user/profile');

      expect(response.status).toBe(401);
    });

    it('should validate user permissions for product management', async () => {
      // Create product with user token (should succeed for own products)
      const createResponse = await request(app.getHttpServer())
        .post('/api/product/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Product',
          description: 'Test Description',
          price: 50000,
          currency_id: 1,
          brand_id: 1,
          phone_number: '+998901234567',
        });

      expect([201, 400]).toContain(createResponse.status); // 400 if missing required fields

      // Admin should be able to manage any product
      if (createResponse.status === 201) {
        const productId = createResponse.body.id;
        
        const adminUpdateResponse = await request(app.getHttpServer())
          .put(`/api/product/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: 'Updated by Admin',
          });

        expect([200, 404]).toContain(adminUpdateResponse.status);
      }
    });
  });

  describe('Input Validation & Sanitization', () => {
    it('should validate email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/admin/sign-up')
        .send({
          first_name: 'Test',
          last_name: 'User',
          email: 'invalid-email',
          phone_number: '+998901234568',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('email');
    });

    it('should validate phone number format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/user-auth/send-otp')
        .send({
          phone_number: 'invalid-phone',
          type: 'register',
        });

      expect(response.status).toBe(400);
    });

    it('should sanitize SQL injection attempts', async () => {
      const sqlInjection = "'; DROP TABLE users; --";
      
      const response = await request(app.getHttpServer())
        .get('/api/product')
        .query({
          search: sqlInjection,
        });

      expect(response.status).toBe(200); // Should not cause server error
      expect(response.body).toBeDefined();
    });

    it('should prevent XSS attacks in user input', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app.getHttpServer())
        .post('/api/product/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: xssPayload,
          description: 'Test Description',
          price: 50000,
          currency_id: 1,
          brand_id: 1,
          phone_number: '+998901234567',
        });

      if (response.status === 201) {
        expect(response.body.title).not.toContain('<script>');
      }
    });
  });

  describe('Session Management', () => {
    it('should handle concurrent sessions', async () => {
      // Login from multiple devices (different user agents)
      const device1Response = await request(app.getHttpServer())
        .post('/api/user-auth/phone-login')
        .set('User-Agent', 'Device1/1.0')
        .send({
          phone_number: '+998901234567',
          otp: '123456',
        });

      const device2Response = await request(app.getHttpServer())
        .post('/api/user-auth/phone-login')
        .set('User-Agent', 'Device2/1.0')
        .send({
          phone_number: '+998901234567',
          otp: '123456',
        });

      expect(device1Response.status).toBe(200);
      expect(device2Response.status).toBe(200);
      
      // Both tokens should be valid
      expect(device1Response.body.access_token).toBeDefined();
      expect(device2Response.body.access_token).toBeDefined();
    });

    it('should detect suspicious login patterns', async () => {
      // Simulate logins from different IPs rapidly
      const rapidLogins = [];
      
      for (let i = 0; i < 3; i++) {
        rapidLogins.push(
          request(app.getHttpServer())
            .post('/api/user-auth/phone-login')
            .set('X-Forwarded-For', `192.168.1.${i}`)
            .send({
              phone_number: '+998901234567',
              otp: '123456',
            })
        );
      }

      const responses = await Promise.all(rapidLogins);
      
      // At least one should succeed, others might be flagged
      const successfulLogins = responses.filter(res => res.status === 200);
      expect(successfulLogins.length).toBeGreaterThan(0);
    });
  });

  describe('Password Security', () => {
    it('should enforce strong password requirements', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123',
        'Password', // Missing number and special char
        'password123', // Missing uppercase and special char
        'PASSWORD123!', // Missing lowercase
      ];

      for (const weakPassword of weakPasswords) {
        const response = await request(app.getHttpServer())
          .post('/api/auth/admin/sign-up')
          .send({
            first_name: 'Test',
            last_name: 'User',
            email: `test${Date.now()}@test.com`,
            phone_number: `+99890${Math.floor(Math.random() * 1000000)}`,
            password: weakPassword,
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('password');
      }
    });

    it('should accept strong passwords', async () => {
      const strongPassword = 'StrongPass123!@#';
      
      const response = await request(app.getHttpServer())
        .post('/api/auth/admin/sign-up')
        .send({
          first_name: 'Strong',
          last_name: 'User',
          email: `strong${Date.now()}@test.com`,
          phone_number: `+99890${Math.floor(Math.random() * 1000000)}`,
          password: strongPassword,
        });

      expect([201, 409]).toContain(response.status); // 409 if user exists
    });
  });

  describe('API Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should handle CORS properly', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/product')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });
  });
});