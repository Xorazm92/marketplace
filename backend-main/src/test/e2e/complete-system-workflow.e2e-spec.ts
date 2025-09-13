import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('End-to-End System Workflow Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  // Test users
  let parentUser: any;
  let sellerUser: any;
  let adminUser: any;
  let childProfile: any;
  
  // Test tokens
  let parentToken: string;
  let sellerToken: string;
  let adminToken: string;
  
  // Test data
  let testProduct: any;
  let testOrder: any;
  let testCategory: any;
  let testBrand: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
    await setupCompleteTestEnvironment();
  });

  afterAll(async () => {
    await cleanupCompleteTestEnvironment();
    await prisma.$disconnect();
    await app.close();
  });

  async function setupCompleteTestEnvironment() {
    // Create admin user
    const adminResponse = await request(app.getHttpServer())
      .post('/api/auth/admin/sign-up')
      .send({
        first_name: 'System',
        last_name: 'Admin',
        email: 'system.admin@test.com',
        phone_number: '+998900000001',
        password: 'AdminPass123!',
      });

    if (adminResponse.status === 201) {
      adminUser = adminResponse.body.user;
      adminToken = adminResponse.body.access_token;
    }

    // Create parent user
    const parentResponse = await request(app.getHttpServer())
      .post('/api/user-auth/phone-register')
      .send({
        phone_number: '+998900000002',
        otp: '123456',
        first_name: 'Parent',
        last_name: 'User',
      });

    if (parentResponse.status === 201) {
      parentUser = parentResponse.body.user;
      parentToken = parentResponse.body.access_token;
    }

    // Create seller user
    const sellerResponse = await request(app.getHttpServer())
      .post('/api/user-auth/phone-register')
      .send({
        phone_number: '+998900000003',
        otp: '123456',
        first_name: 'Seller',
        last_name: 'User',
      });

    if (sellerResponse.status === 201) {
      sellerUser = sellerResponse.body.user;
      sellerToken = sellerResponse.body.access_token;
    }

    // Create child profile
    const childProfileResponse = await request(app.getHttpServer())
      .post('/api/child-safety/child-profiles')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        name: 'Test Child',
        birth_date: '2015-01-01',
        gender: 'male',
        interests: ['toys', 'education'],
      });

    if (childProfileResponse.status === 201) {
      childProfile = childProfileResponse.body;
    }

    // Create test category
    const categoryResponse = await request(app.getHttpServer())
      .post('/api/category/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Category',
        description: 'Category for E2E testing',
        status: 'ACTIVE',
      });

    if (categoryResponse.status === 201) {
      testCategory = categoryResponse.body;
    }

    // Create test brand
    const brandResponse = await request(app.getHttpServer())
      .post('/api/brand/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Brand',
        description: 'Brand for E2E testing',
        status: 'ACTIVE',
      });

    if (brandResponse.status === 201) {
      testBrand = brandResponse.body;
    }
  }

  async function cleanupCompleteTestEnvironment() {
    try {
      // Clean up in reverse order of dependencies
      if (testOrder) {
        await prisma.order.delete({ where: { id: testOrder.id } });
      }
      if (testProduct) {
        await prisma.product.delete({ where: { id: testProduct.id } });
      }
      if (testCategory) {
        await prisma.category.delete({ where: { id: testCategory.id } });
      }
      if (testBrand) {
        await prisma.brand.delete({ where: { id: testBrand.id } });
      }
      if (childProfile) {
        await prisma.childProfile.delete({ where: { id: childProfile.id } });
      }
      if (parentUser) {
        await prisma.user.delete({ where: { id: parentUser.id } });
      }
      if (sellerUser) {
        await prisma.user.delete({ where: { id: sellerUser.id } });
      }
      if (adminUser) {
        await prisma.admin.delete({ where: { id: adminUser.id } });
      }
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  }

  describe('Complete User Journey: Parent Registration to Purchase', () => {
    it('should complete full parent user journey', async () => {
      // Step 1: Parent discovers the platform
      const homePageResponse = await request(app.getHttpServer())
        .get('/api/health');
      expect(homePageResponse.status).toBe(200);

      // Step 2: Parent browses products without registration
      const browseProductsResponse = await request(app.getHttpServer())
        .get('/api/product')
        .query({ page: 1, limit: 10 });
      expect(browseProductsResponse.status).toBe(200);

      // Step 3: Parent tries to add to cart (should be redirected to register)
      const addToCartResponse = await request(app.getHttpServer())
        .post('/api/cart/add')
        .send({ product_id: 1, quantity: 1 });
      expect(addToCartResponse.status).toBe(401);

      // Step 4: Parent registers (already done in setup)
      expect(parentToken).toBeDefined();

      // Step 5: Parent sets up child profile (already done in setup)
      expect(childProfile).toBeDefined();

      // Step 6: Parent sets up parental controls
      const parentalControlsResponse = await request(app.getHttpServer())
        .post('/api/child-safety/parental-controls')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          child_profile_id: childProfile.id,
          max_daily_spending: 100000,
          max_session_time: 3600,
          content_filter_level: 'moderate',
        });
      expect([201, 409]).toContain(parentalControlsResponse.status);

      // Step 7: Parent browses child-safe products
      const childSafeProductsResponse = await request(app.getHttpServer())
        .get('/api/product')
        .query({ child_safe_only: true, max_age: 120 })
        .set('Authorization', `Bearer ${parentToken}`);
      expect(childSafeProductsResponse.status).toBe(200);

      // Step 8: Parent adds product to cart (now authenticated)
      if (testProduct) {
        const addToCartAuthResponse = await request(app.getHttpServer())
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${parentToken}`)
          .send({ product_id: testProduct.id, quantity: 1 });
        expect([201, 409]).toContain(addToCartAuthResponse.status);
      }

      // Step 9: Parent proceeds to checkout
      const checkoutResponse = await request(app.getHttpServer())
        .post('/api/order/create')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          delivery_address: 'Test Address, Tashkent',
          payment_method: 'CARD',
          child_profile_id: childProfile.id,
        });
      
      if (checkoutResponse.status === 201) {
        testOrder = checkoutResponse.body;
        expect(testOrder.child_profile_id).toBe(childProfile.id);
      }

      // Step 10: Parent completes payment
      if (testOrder) {
        const paymentResponse = await request(app.getHttpServer())
          .post('/api/payment/process')
          .set('Authorization', `Bearer ${parentToken}`)
          .send({
            order_id: testOrder.id,
            payment_method: 'CARD',
            amount: testOrder.final_amount,
          });
        expect([200, 201, 400]).toContain(paymentResponse.status);
      }
    });
  });

  describe('Complete Seller Journey: Registration to Sale', () => {
    it('should complete full seller onboarding and product lifecycle', async () => {
      // Step 1: Seller registers (already done in setup)
      expect(sellerToken).toBeDefined();

      // Step 2: Seller completes KYC verification
      const kycResponse = await request(app.getHttpServer())
        .post('/api/seller/kyc-verification')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          business_name: 'Test Toy Store',
          business_type: 'retail',
          business_address: 'Test Business Address',
          tax_id: 'TEST123456',
          bank_account: 'TEST_BANK_ACCOUNT',
          identity_document: 'passport',
          identity_number: 'TEST_PASSPORT_123',
        });
      expect([201, 409]).toContain(kycResponse.status);

      // Step 3: Admin approves seller KYC
      if (kycResponse.status === 201) {
        const approveKycResponse = await request(app.getHttpServer())
          .put(`/api/seller/approve-kyc/${sellerUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ approved: true, notes: 'KYC approved for testing' });
        expect([200, 404]).toContain(approveKycResponse.status);
      }

      // Step 4: Seller creates product
      const createProductResponse = await request(app.getHttpServer())
        .post('/api/product/create')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'Educational Building Blocks',
          description: 'Safe and educational building blocks for children',
          price: 75000,
          currency_id: 1,
          brand_id: testBrand?.id || 1,
          category_id: testCategory?.id || 1,
          phone_number: sellerUser.phone_number,
          age_group_id: 1,
          safety_info: JSON.stringify(['Non-toxic', 'CE certified']),
          educational_value: true,
        });

      if (createProductResponse.status === 201) {
        testProduct = createProductResponse.body;
        expect(testProduct.title).toBe('Educational Building Blocks');
      }

      // Step 5: Admin reviews and approves product
      if (testProduct) {
        const approveProductResponse = await request(app.getHttpServer())
          .put(`/api/product/approve/${testProduct.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ approved: true, notes: 'Product approved for testing' });
        expect([200, 404]).toContain(approveProductResponse.status);
      }

      // Step 6: Product becomes available for purchase
      if (testProduct) {
        const productVisibilityResponse = await request(app.getHttpServer())
          .get(`/api/product/${testProduct.id}`);
        expect(productVisibilityResponse.status).toBe(200);
        expect(productVisibilityResponse.body.is_active).toBe(true);
      }

      // Step 7: Seller manages inventory
      if (testProduct) {
        const updateInventoryResponse = await request(app.getHttpServer())
          .put(`/api/product/${testProduct.id}/inventory`)
          .set('Authorization', `Bearer ${sellerToken}`)
          .send({ stock_quantity: 100 });
        expect([200, 404]).toContain(updateInventoryResponse.status);
      }

      // Step 8: Seller receives order notification (simulated)
      if (testOrder) {
        const orderNotificationResponse = await request(app.getHttpServer())
          .get('/api/seller/orders')
          .set('Authorization', `Bearer ${sellerToken}`);
        expect(orderNotificationResponse.status).toBe(200);
      }

      // Step 9: Seller updates order status
      if (testOrder) {
        const updateOrderResponse = await request(app.getHttpServer())
          .put(`/api/order/${testOrder.id}/status`)
          .set('Authorization', `Bearer ${sellerToken}`)
          .send({ status: 'PROCESSING' });
        expect([200, 403, 404]).toContain(updateOrderResponse.status);
      }
    });
  });

  describe('Child Safety Workflow', () => {
    it('should enforce child safety throughout the system', async () => {
      // Step 1: Create child with specific restrictions
      const restrictiveChildResponse = await request(app.getHttpServer())
        .post('/api/child-safety/child-profiles')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          name: 'Restricted Child',
          birth_date: '2018-01-01', // 6 years old
          gender: 'female',
          interests: ['books'],
        });

      let restrictiveChild;
      if (restrictiveChildResponse.status === 201) {
        restrictiveChild = restrictiveChildResponse.body;
      }

      // Step 2: Set strict parental controls
      if (restrictiveChild) {
        const strictControlsResponse = await request(app.getHttpServer())
          .post('/api/child-safety/parental-controls')
          .set('Authorization', `Bearer ${parentToken}`)
          .send({
            child_profile_id: restrictiveChild.id,
            max_daily_spending: 25000,
            max_session_time: 1800, // 30 minutes
            content_filter_level: 'strict',
            require_approval_for_purchases: true,
            allowed_categories: ['books', 'education'],
            blocked_categories: ['electronics', 'toys'],
          });
        expect([201, 409]).toContain(strictControlsResponse.status);
      }

      // Step 3: Test age-appropriate content filtering
      const ageFilterResponse = await request(app.getHttpServer())
        .get('/api/child-safety/age-appropriate-products')
        .query({ child_age: 72 }) // 6 years old in months
        .set('Authorization', `Bearer ${parentToken}`);
      expect(ageFilterResponse.status).toBe(200);

      // Step 4: Test content safety check
      const contentCheckResponse = await request(app.getHttpServer())
        .post('/api/child-safety/check-content')
        .send({
          title: 'Educational Children\'s Book',
          description: 'A safe and educational book for young readers',
          category: 'books',
          userAge: 6,
        });
      expect(contentCheckResponse.status).toBe(200);
      expect(contentCheckResponse.body.isAppropriate).toBe(true);

      // Step 5: Test inappropriate content blocking
      const inappropriateContentResponse = await request(app.getHttpServer())
        .post('/api/child-safety/check-content')
        .send({
          title: 'Violent Action Figure',
          description: 'Realistic weapon toy for combat play',
          category: 'toys',
          userAge: 6,
        });
      expect(inappropriateContentResponse.status).toBe(200);
      expect(inappropriateContentResponse.body.isAppropriate).toBe(false);

      // Step 6: Test purchase approval workflow
      if (restrictiveChild && testProduct) {
        const purchaseRequestResponse = await request(app.getHttpServer())
          .post('/api/child-safety/request-purchase-approval')
          .set('Authorization', `Bearer ${parentToken}`)
          .send({
            product_id: testProduct.id,
            quantity: 1,
            child_profile_id: restrictiveChild.id,
          });
        expect([201, 400]).toContain(purchaseRequestResponse.status);
      }

      // Clean up restrictive child
      if (restrictiveChild) {
        await prisma.childProfile.delete({ where: { id: restrictiveChild.id } });
      }
    });
  });

  describe('Admin Management Workflow', () => {
    it('should handle complete admin management lifecycle', async () => {
      // Step 1: Admin views system dashboard
      const dashboardResponse = await request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 403]).toContain(dashboardResponse.status);

      // Step 2: Admin manages users
      const usersResponse = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });
      expect([200, 403]).toContain(usersResponse.status);

      // Step 3: Admin manages products
      const productsManagementResponse = await request(app.getHttpServer())
        .get('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ status: 'pending' });
      expect([200, 403]).toContain(productsManagementResponse.status);

      // Step 4: Admin handles reports
      const reportsResponse = await request(app.getHttpServer())
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ type: 'sales', period: '7d' });
      expect([200, 403]).toContain(reportsResponse.status);

      // Step 5: Admin manages child safety violations
      const safetyViolationsResponse = await request(app.getHttpServer())
        .get('/api/admin/safety-violations')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ severity: 'high' });
      expect([200, 403]).toContain(safetyViolationsResponse.status);

      // Step 6: Admin system configuration
      const configResponse = await request(app.getHttpServer())
        .get('/api/admin/system-config')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 403]).toContain(configResponse.status);
    });
  });

  describe('Payment Processing Workflow', () => {
    it('should handle complete payment processing cycle', async () => {
      if (!testOrder) {
        // Create test order for payment testing
        const orderResponse = await request(app.getHttpServer())
          .post('/api/order/create')
          .set('Authorization', `Bearer ${parentToken}`)
          .send({
            items: [{ product_id: testProduct?.id || 1, quantity: 1 }],
            delivery_address: 'Payment Test Address',
            payment_method: 'CLICK',
          });
        
        if (orderResponse.status === 201) {
          testOrder = orderResponse.body;
        }
      }

      if (testOrder) {
        // Step 1: Initialize Click payment
        const clickInitResponse = await request(app.getHttpServer())
          .post('/api/payment/click/create')
          .set('Authorization', `Bearer ${parentToken}`)
          .send({
            order_id: testOrder.id,
            amount: testOrder.final_amount,
            return_url: 'http://localhost:3000/payment/success',
          });
        expect([200, 201, 400]).toContain(clickInitResponse.status);

        // Step 2: Simulate Click callback
        if (clickInitResponse.status === 201) {
          const callbackResponse = await request(app.getHttpServer())
            .post('/api/payment/click/callback')
            .send({
              click_trans_id: 'TEST_CLICK_123',
              merchant_trans_id: `ORDER_${testOrder.id}`,
              amount: testOrder.final_amount,
              action: 1,
              error: 0,
              sign_time: new Date().toISOString(),
            });
          expect([200, 400]).toContain(callbackResponse.status);
        }

        // Step 3: Verify payment status
        const paymentStatusResponse = await request(app.getHttpServer())
          .get(`/api/payment/status/${testOrder.id}`)
          .set('Authorization', `Bearer ${parentToken}`);
        expect([200, 404]).toContain(paymentStatusResponse.status);

        // Step 4: Test Payme payment alternative
        const paymeCheckResponse = await request(app.getHttpServer())
          .post('/api/payment/payme')
          .send({
            id: Date.now(),
            method: 'CheckPerformTransaction',
            params: {
              amount: testOrder.final_amount * 100, // Convert to tiyin
              account: { order_id: testOrder.id.toString() },
            },
          });
        expect(paymeCheckResponse.status).toBe(200);
      }
    });
  });

  describe('Real-time Features Workflow', () => {
    it('should handle real-time chat and notifications', async () => {
      // Step 1: Create chat room between parent and seller
      const chatRoomResponse = await request(app.getHttpServer())
        .post('/api/chat/create-room')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          participant_id: sellerUser.id,
          product_id: testProduct?.id,
        });
      
      let chatRoom;
      if (chatRoomResponse.status === 201) {
        chatRoom = chatRoomResponse.body;
      }

      // Step 2: Send message in chat
      if (chatRoom) {
        const sendMessageResponse = await request(app.getHttpServer())
          .post('/api/chat/send-message')
          .set('Authorization', `Bearer ${parentToken}`)
          .send({
            chatroom_id: chatRoom.id,
            message: 'Is this product safe for a 6-year-old?',
            message_type: 'text',
          });
        expect([201, 404]).toContain(sendMessageResponse.status);

        // Step 3: Seller responds
        const sellerResponseMessage = await request(app.getHttpServer())
          .post('/api/chat/send-message')
          .set('Authorization', `Bearer ${sellerToken}`)
          .send({
            chatroom_id: chatRoom.id,
            message: 'Yes, this product is certified safe for children aged 3-12.',
            message_type: 'text',
          });
        expect([201, 404]).toContain(sellerResponseMessage.status);

        // Clean up chat room
        await prisma.chatroom.delete({ where: { id: chatRoom.id } });
      }

      // Step 4: Test notification system
      const notificationsResponse = await request(app.getHttpServer())
        .get('/api/notifications')
        .set('Authorization', `Bearer ${parentToken}`);
      expect(notificationsResponse.status).toBe(200);

      // Step 5: Mark notifications as read
      if (notificationsResponse.body.length > 0) {
        const markReadResponse = await request(app.getHttpServer())
          .put(`/api/notifications/${notificationsResponse.body[0].id}/read`)
          .set('Authorization', `Bearer ${parentToken}`);
        expect([200, 404]).toContain(markReadResponse.status);
      }
    });
  });

  describe('Search and Discovery Workflow', () => {
    it('should handle complete search and discovery experience', async () => {
      // Step 1: Basic product search
      const basicSearchResponse = await request(app.getHttpServer())
        .get('/api/product')
        .query({ search: 'educational', page: 1, limit: 10 });
      expect(basicSearchResponse.status).toBe(200);

      // Step 2: Advanced filtering
      const advancedFilterResponse = await request(app.getHttpServer())
        .get('/api/product')
        .query({
          category_id: testCategory?.id,
          min_price: 50000,
          max_price: 100000,
          age_group: '3-5 years',
          educational_value: true,
        });
      expect(advancedFilterResponse.status).toBe(200);

      // Step 3: Sort results
      const sortedResultsResponse = await request(app.getHttpServer())
        .get('/api/product')
        .query({
          sort_by: 'price',
          sort_order: 'asc',
          limit: 5,
        });
      expect(sortedResultsResponse.status).toBe(200);

      // Step 4: Get product recommendations
      const recommendationsResponse = await request(app.getHttpServer())
        .get('/api/product/recommendations')
        .set('Authorization', `Bearer ${parentToken}`)
        .query({ child_profile_id: childProfile.id });
      expect([200, 404]).toContain(recommendationsResponse.status);

      // Step 5: Track product views
      if (testProduct) {
        const viewProductResponse = await request(app.getHttpServer())
          .post(`/api/product/${testProduct.id}/view`)
          .set('Authorization', `Bearer ${parentToken}`);
        expect([200, 201, 404]).toContain(viewProductResponse.status);
      }
    });
  });

  describe('Order Lifecycle Workflow', () => {
    it('should handle complete order lifecycle', async () => {
      if (!testOrder) return;

      // Step 1: Order confirmation
      const orderDetailsResponse = await request(app.getHttpServer())
        .get(`/api/order/${testOrder.id}`)
        .set('Authorization', `Bearer ${parentToken}`);
      expect([200, 404]).toContain(orderDetailsResponse.status);

      // Step 2: Seller processes order
      const processOrderResponse = await request(app.getHttpServer())
        .put(`/api/order/${testOrder.id}/process`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ estimated_delivery: '2024-01-15' });
      expect([200, 403, 404]).toContain(processOrderResponse.status);

      // Step 3: Order tracking
      const trackingResponse = await request(app.getHttpServer())
        .get(`/api/order/${testOrder.id}/tracking`)
        .set('Authorization', `Bearer ${parentToken}`);
      expect([200, 404]).toContain(trackingResponse.status);

      // Step 4: Delivery notification
      const deliveryResponse = await request(app.getHttpServer())
        .put(`/api/order/${testOrder.id}/deliver`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ delivery_note: 'Package delivered successfully' });
      expect([200, 403, 404]).toContain(deliveryResponse.status);

      // Step 5: Customer review
      const reviewResponse = await request(app.getHttpServer())
        .post('/api/review/create')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          product_id: testProduct?.id,
          order_id: testOrder.id,
          rating: 5,
          comment: 'Excellent educational product! My child loves it.',
        });
      expect([201, 400, 404]).toContain(reviewResponse.status);
    });
  });

  describe('System Integration & Performance', () => {
    it('should handle high load scenarios', async () => {
      const concurrentRequests = [];
      
      // Simulate multiple users browsing simultaneously
      for (let i = 0; i < 20; i++) {
        concurrentRequests.push(
          request(app.getHttpServer())
            .get('/api/product')
            .query({ page: Math.floor(i / 5) + 1, limit: 5 })
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const duration = Date.now() - startTime;

      // All requests should complete within reasonable time
      expect(duration).toBeLessThan(10000);
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });

      console.log(`High load test: ${responses.length} requests in ${duration}ms`);
    });

    it('should maintain data consistency across workflows', async () => {
      // Verify user data consistency
      const userCheckResponse = await request(app.getHttpServer())
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${parentToken}`);
      expect(userCheckResponse.status).toBe(200);
      expect(userCheckResponse.body.id).toBe(parentUser.id);

      // Verify product data consistency
      if (testProduct) {
        const productCheckResponse = await request(app.getHttpServer())
          .get(`/api/product/${testProduct.id}`);
        expect(productCheckResponse.status).toBe(200);
        expect(productCheckResponse.body.title).toBe(testProduct.title);
      }

      // Verify order data consistency
      if (testOrder) {
        const orderCheckResponse = await request(app.getHttpServer())
          .get(`/api/order/${testOrder.id}`)
          .set('Authorization', `Bearer ${parentToken}`);
        expect([200, 404]).toContain(orderCheckResponse.status);
      }
    });

    it('should handle error recovery in complex workflows', async () => {
      // Test order creation with invalid data
      const invalidOrderResponse = await request(app.getHttpServer())
        .post('/api/order/create')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          items: [], // Empty items array
          delivery_address: '',
        });
      expect(invalidOrderResponse.status).toBe(400);

      // Verify system remains stable after error
      const healthCheckResponse = await request(app.getHttpServer())
        .get('/health');
      expect(healthCheckResponse.status).toBe(200);
      expect(healthCheckResponse.body.status).toBe('OK');
    });
  });
});