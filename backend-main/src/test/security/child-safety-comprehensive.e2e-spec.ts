import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { ChildSafetyService } from '../../child-safety/child-safety.service';

describe('Child Safety System Tests (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let childSafetyService: ChildSafetyService;
  let parentToken: string;
  let childToken: string;
  let parentId: number;
  let childId: number;
  let childProfileId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    childSafetyService = app.get<ChildSafetyService>(ChildSafetyService);
    
    await app.init();
    await setupTestUsers();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
    await app.close();
  });

  async function setupTestUsers() {
    // Create parent user
    const parentResponse = await request(app.getHttpServer())
      .post('/api/user-auth/phone-register')
      .send({
        phone_number: '+998901111111',
        otp: '123456',
        first_name: 'Parent',
        last_name: 'User',
      });

    if (parentResponse.status === 201) {
      parentToken = parentResponse.body.access_token;
      parentId = parentResponse.body.user.id;
    }

    // Create child profile
    const childProfileResponse = await request(app.getHttpServer())
      .post('/api/child-safety/child-profiles')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        name: 'Test Child',
        birth_date: '2015-01-01',
        gender: 'male',
        interests: ['toys', 'books', 'education'],
        allergies: [],
      });

    if (childProfileResponse.status === 201) {
      childProfileId = childProfileResponse.body.id;
    }
  }

  async function cleanupTestData() {
    try {
      // Clean up child profiles
      await prisma.childProfile.deleteMany({
        where: { parent_id: parentId },
      });

      // Clean up parental controls
      await prisma.parentalControl.deleteMany({
        where: { parent_id: parentId },
      });

      // Clean up users
      await prisma.user.deleteMany({
        where: {
          OR: [
            { id: parentId },
            { id: childId },
          ],
        },
      });
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  }

  describe('Age-Based Content Filtering', () => {
    let testProducts: any[] = [];

    beforeAll(async () => {
      // Create test products with different age groups
      const ageGroups = [
        { id: 1, name: '0-6 months', min_age: 0, max_age: 6 },
        { id: 2, name: '6-12 months', min_age: 6, max_age: 12 },
        { id: 3, name: '1-2 years', min_age: 12, max_age: 24 },
        { id: 4, name: '3-5 years', min_age: 36, max_age: 60 },
        { id: 5, name: '6-12 years', min_age: 72, max_age: 144 },
      ];

      // Ensure age groups exist
      for (const ageGroup of ageGroups) {
        await prisma.ageGroup.upsert({
          where: { id: ageGroup.id },
          update: ageGroup,
          create: ageGroup,
        });
      }

      // Create test products
      const products = [
        {
          title: 'Baby Rattle',
          description: 'Safe rattle for infants',
          price: 15000,
          age_group_id: 1,
          safety_info: JSON.stringify(['BPA-free', 'Non-toxic']),
        },
        {
          title: 'Building Blocks',
          description: 'Educational building blocks',
          price: 25000,
          age_group_id: 4,
          safety_info: JSON.stringify(['No small parts', 'Safe materials']),
        },
        {
          title: 'Science Kit',
          description: 'Advanced science experiments',
          price: 75000,
          age_group_id: 5,
          safety_info: JSON.stringify(['Adult supervision required']),
        },
      ];

      for (const product of products) {
        try {
          const createdProduct = await prisma.product.create({
            data: {
              ...product,
              currency_id: 1,
              brand_id: 1,
              phone_number: '+998901111111',
              user_id: parentId,
            },
          });
          testProducts.push(createdProduct);
        } catch (error) {
          console.log('Product creation error:', error);
        }
      }
    });

    it('should filter products by age appropriateness', async () => {
      // Test for a 2-year-old child (24 months)
      const response = await request(app.getHttpServer())
        .get('/api/child-safety/age-appropriate-products')
        .query({ child_age: 24 })
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(200);
      
      // Should include products for 0-6 months, 6-12 months, and 1-2 years
      // Should exclude products for 3-5 years and 6-12 years
      const appropriateProducts = response.body;
      const ageGroups = appropriateProducts.map((p: any) => p.age_group_id);
      
      expect(ageGroups).toContain(1); // 0-6 months
      expect(ageGroups).toContain(2); // 6-12 months
      expect(ageGroups).toContain(3); // 1-2 years
      expect(ageGroups).not.toContain(5); // 6-12 years (too advanced)
    });

    it('should analyze content safety automatically', async () => {
      const testContent = {
        title: 'Educational Building Blocks',
        description: 'Safe and fun building blocks for children to learn and play',
        category: 'toys',
        tags: ['educational', 'safe', 'creative'],
        userAge: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/api/child-safety/check-content')
        .send(testContent);

      expect(response.status).toBe(200);
      expect(response.body.isAppropriate).toBe(true);
      expect(response.body.suggestedAgeGroup).toBeDefined();
    });

    it('should flag inappropriate content', async () => {
      const inappropriateContent = {
        title: 'Violent Action Figure',
        description: 'Realistic weapon toy for aggressive play fighting',
        category: 'toys',
        tags: ['weapon', 'fighting', 'violence'],
        userAge: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/api/child-safety/check-content')
        .send(inappropriateContent);

      expect(response.status).toBe(200);
      expect(response.body.isAppropriate).toBe(false);
      expect(response.body.reasons).toContain('inappropriate content detected');
    });

    it('should provide educational content recommendations', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/child-safety/educational-recommendations')
        .query({ child_age: 60, interests: ['science', 'math'] }) // 5-year-old
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('educational_value');
        expect(response.body[0]).toHaveProperty('learning_objectives');
      }
    });
  });

  describe('Parental Control System', () => {
    let parentalControlId: number;

    it('should create parental control settings', async () => {
      const controlSettings = {
        child_profile_id: childProfileId,
        max_daily_spending: 50000, // 50,000 UZS
        max_session_time: 3600, // 1 hour
        allowed_categories: ['toys', 'books', 'education'],
        blocked_categories: ['electronics', 'mature'],
        time_restrictions: {
          enabled: true,
          start_time: '09:00',
          end_time: '18:00',
          allowed_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
        content_filter_level: 'strict',
        require_approval_for_purchases: true,
      };

      const response = await request(app.getHttpServer())
        .post('/api/child-safety/parental-controls')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(controlSettings);

      expect(response.status).toBe(201);
      expect(response.body.max_daily_spending).toBe(50000);
      expect(response.body.content_filter_level).toBe('strict');
      parentalControlId = response.body.id;
    });

    it('should enforce spending limits', async () => {
      // Simulate a purchase that exceeds daily limit
      const expensiveOrder = {
        items: [
          {
            product_id: testProducts[0]?.id,
            quantity: 5,
            price: 15000,
          },
        ],
        total_amount: 75000, // Exceeds 50,000 limit
        child_profile_id: childProfileId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/child-safety/validate-purchase')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(expensiveOrder);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('spending limit');
      expect(response.body.violation_type).toBe('SPENDING_LIMIT_EXCEEDED');
    });

    it('should enforce time restrictions', async () => {
      // Mock current time to be outside allowed hours (e.g., 20:00)
      const mockTime = new Date();
      mockTime.setHours(20, 0, 0, 0);

      const response = await request(app.getHttpServer())
        .post('/api/child-safety/check-time-access')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          child_profile_id: childProfileId,
          current_time: mockTime.toISOString(),
        });

      expect(response.status).toBe(200);
      expect(response.body.allowed).toBe(false);
      expect(response.body.reason).toContain('outside allowed time');
    });

    it('should filter content by category restrictions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product')
        .query({
          child_profile_id: childProfileId,
          apply_parental_filters: true,
        })
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(200);
      
      // Should only return products from allowed categories
      if (response.body.data && response.body.data.length > 0) {
        const categories = response.body.data.map((p: any) => p.category?.name);
        const blockedCategories = ['electronics', 'mature'];
        
        categories.forEach((category: string) => {
          expect(blockedCategories).not.toContain(category);
        });
      }
    });

    it('should require parental approval for purchases', async () => {
      const purchaseRequest = {
        product_id: testProducts[0]?.id,
        quantity: 1,
        child_profile_id: childProfileId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/child-safety/request-purchase-approval')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(purchaseRequest);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('PENDING_APPROVAL');
      expect(response.body.requires_parent_approval).toBe(true);
    });

    it('should allow parents to approve/reject purchase requests', async () => {
      // First create a purchase request
      const purchaseRequest = await request(app.getHttpServer())
        .post('/api/child-safety/request-purchase-approval')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          product_id: testProducts[0]?.id,
          quantity: 1,
          child_profile_id: childProfileId,
        });

      if (purchaseRequest.status === 201) {
        const requestId = purchaseRequest.body.id;

        // Approve the request
        const approvalResponse = await request(app.getHttpServer())
          .post(`/api/child-safety/approve-purchase/${requestId}`)
          .set('Authorization', `Bearer ${parentToken}`)
          .send({
            approved: true,
            parent_note: 'Educational value approved',
          });

        expect(approvalResponse.status).toBe(200);
        expect(approvalResponse.body.status).toBe('APPROVED');
      }
    });
  });

  describe('Content Moderation & Safety', () => {
    it('should detect and block inappropriate images', async () => {
      // Mock image analysis
      const imageAnalysisResult = await childSafetyService.analyzeImageSafety(
        'https://example.com/test-image.jpg'
      );

      expect(typeof imageAnalysisResult).toBe('boolean');
    });

    it('should moderate user-generated content', async () => {
      const reviewContent = {
        product_id: testProducts[0]?.id,
        rating: 5,
        comment: 'This toy is dangerous and has sharp edges that could hurt children!',
        user_id: parentId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/review/create')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(reviewContent);

      if (response.status === 201) {
        expect(response.body.is_flagged).toBe(true);
        expect(response.body.moderation_status).toBe('PENDING');
      }
    });

    it('should auto-approve safe content', async () => {
      const safeReviewContent = {
        product_id: testProducts[0]?.id,
        rating: 5,
        comment: 'Great educational toy! My child loves learning with it.',
        user_id: parentId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/review/create')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(safeReviewContent);

      if (response.status === 201) {
        expect(response.body.is_flagged).toBe(false);
        expect(response.body.moderation_status).toBe('APPROVED');
      }
    });

    it('should provide safety information for products', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/child-safety/product-safety/${testProducts[0]?.id}`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('safety_info');
      expect(response.body).toHaveProperty('age_appropriateness');
      expect(response.body).toHaveProperty('safety_certifications');
    });
  });

  describe('Child Profile Management', () => {
    it('should create child profiles with safety settings', async () => {
      const childProfile = {
        name: 'Another Test Child',
        birth_date: '2018-06-15',
        gender: 'female',
        interests: ['art', 'music', 'books'],
        allergies: ['latex', 'nuts'],
      };

      const response = await request(app.getHttpServer())
        .post('/api/child-safety/child-profiles')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(childProfile);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Another Test Child');
      expect(response.body.interests).toEqual(['art', 'music', 'books']);
    });

    it('should update child profiles', async () => {
      const updates = {
        interests: ['toys', 'science', 'sports'],
        allergies: ['peanuts'],
      };

      const response = await request(app.getHttpServer())
        .put(`/api/child-safety/child-profiles/${childProfileId}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.interests).toEqual(['toys', 'science', 'sports']);
    });

    it('should get child profiles for parent', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/child-safety/child-profiles')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should calculate age-appropriate recommendations', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/child-safety/recommendations/${childProfileId}`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('recommended_products');
      expect(response.body).toHaveProperty('educational_content');
      expect(response.body).toHaveProperty('safety_tips');
    });
  });

  describe('Safety Monitoring & Alerts', () => {
    it('should track child activity and generate reports', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/child-safety/activity-report/${childProfileId}`)
        .query({
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        })
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total_time_spent');
      expect(response.body).toHaveProperty('products_viewed');
      expect(response.body).toHaveProperty('purchases_made');
      expect(response.body).toHaveProperty('safety_violations');
    });

    it('should send alerts for safety violations', async () => {
      // Simulate a safety violation
      const violation = {
        child_profile_id: childProfileId,
        violation_type: 'INAPPROPRIATE_CONTENT_ACCESS',
        severity: 'HIGH',
        description: 'Child attempted to access age-inappropriate content',
      };

      const response = await request(app.getHttpServer())
        .post('/api/child-safety/report-violation')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(violation);

      expect(response.status).toBe(201);
      expect(response.body.alert_sent).toBe(true);
      expect(response.body.parent_notified).toBe(true);
    });

    it('should provide safety statistics dashboard', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/child-safety/safety-dashboard')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total_children');
      expect(response.body).toHaveProperty('active_controls');
      expect(response.body).toHaveProperty('recent_violations');
      expect(response.body).toHaveProperty('safety_score');
    });
  });

  describe('Integration with Main System', () => {
    it('should integrate with product search and filtering', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/product')
        .query({
          child_safe_only: true,
          max_age: 60, // 5 years
        });

      expect(response.status).toBe(200);
      
      if (response.body.data && response.body.data.length > 0) {
        // All products should be appropriate for 5-year-olds
        response.body.data.forEach((product: any) => {
          if (product.age_group) {
            expect(product.age_group.max_age).toBeLessThanOrEqual(60);
          }
        });
      }
    });

    it('should integrate with order processing', async () => {
      // Create an order with child safety checks
      const orderData = {
        items: [
          {
            product_id: testProducts[0]?.id,
            quantity: 1,
          },
        ],
        child_profile_id: childProfileId,
        apply_safety_checks: true,
      };

      const response = await request(app.getHttpServer())
        .post('/api/order/create-with-safety-check')
        .set('Authorization', `Bearer ${parentToken}`)
        .send(orderData);

      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body.safety_checked).toBe(true);
        expect(response.body.parental_approval_required).toBeDefined();
      }
    });
  });
});