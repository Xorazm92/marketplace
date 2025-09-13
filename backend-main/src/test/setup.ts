import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test configuration
beforeAll(async () => {
  // Global setup for all tests
  console.log('🧪 Starting comprehensive test suite...');
  
  // Set test timeouts
  jest.setTimeout(30000);
  
  // Mock external services for testing
  mockExternalServices();
});

afterAll(async () => {
  // Global cleanup for all tests
  console.log('✅ Test suite completed.');
});

function mockExternalServices() {
  // Mock SMS service
  jest.mock('twilio', () => ({
    Twilio: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          sid: 'TEST_SMS_SID',
          status: 'sent',
        }),
      },
    })),
  }));

  // Mock email service
  jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({
        messageId: 'TEST_EMAIL_ID',
        response: 'Email sent successfully',
      }),
    }),
  }));

  // Mock payment gateways
  jest.mock('axios', () => ({
    post: jest.fn().mockImplementation((url) => {
      if (url.includes('click')) {
        return Promise.resolve({
          data: {
            payment_url: 'https://test-click-payment.url',
            transaction_id: 'TEST_CLICK_TRANS',
          },
        });
      }
      if (url.includes('payme')) {
        return Promise.resolve({
          data: {
            result: {
              transaction: 'TEST_PAYME_TRANS',
              state: 1,
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    }),
    get: jest.fn().mockResolvedValue({ data: {} }),
  }));

  // Mock file upload
  jest.mock('multer', () => ({
    memoryStorage: jest.fn(),
    diskStorage: jest.fn(),
  }));

  // Mock image processing
  jest.mock('sharp', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      resize: jest.fn().mockReturnThis(),
      jpeg: jest.fn().mockReturnThis(),
      webp: jest.fn().mockReturnThis(),
      toFile: jest.fn().mockResolvedValue({}),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('test')),
    })),
  }));
}

// Global test utilities
global.testUtils = {
  generateTestPhone: () => `+99890${Math.floor(Math.random() * 1000000).toString().padStart(7, '0')}`,
  generateTestEmail: () => `test${Date.now()}@example.com`,
  generateTestPassword: () => 'TestPass123!',
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Test data generators
  createTestUser: () => ({
    first_name: 'Test',
    last_name: 'User',
    phone_number: global.testUtils.generateTestPhone(),
    email: global.testUtils.generateTestEmail(),
  }),
  
  createTestProduct: () => ({
    title: `Test Product ${Date.now()}`,
    description: 'Test product description',
    price: Math.floor(Math.random() * 100000) + 10000,
    currency_id: 1,
    brand_id: 1,
    phone_number: global.testUtils.generateTestPhone(),
  }),
  
  createTestOrder: (userId: number) => ({
    user_id: userId,
    order_number: `TEST-${Date.now()}`,
    total_amount: 50000,
    final_amount: 50000,
    status: 'PENDING',
    payment_status: 'PENDING',
  }),
};

// Extend Jest matchers for better assertions
expect.extend({
  toBeValidPhone(received) {
    const phoneRegex = /^\+998\d{9}$/;
    const pass = phoneRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Uzbek phone number`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Uzbek phone number`,
        pass: false,
      };
    }
  },
  
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
  
  toBeValidJWT(received) {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    const pass = jwtRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid JWT token`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid JWT token`,
        pass: false,
      };
    }
  },
});

// Type declarations for global utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidPhone(): R;
      toBeValidEmail(): R;
      toBeValidJWT(): R;
    }
  }
  
  var testUtils: {
    generateTestPhone(): string;
    generateTestEmail(): string;
    generateTestPassword(): string;
    sleep(ms: number): Promise<void>;
    createTestUser(): object;
    createTestProduct(): object;
    createTestOrder(userId: number): object;
  };
}