import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AgeGroup {
  min: number;
  max: number;
  name: string;
}

export interface SafetyCheck {
  isAppropriate: boolean;
  reason?: string;
  suggestedAgeGroup?: AgeGroup;
}

@Injectable()
export class ChildSafetyService {
  constructor(private prisma: PrismaService) {}

  private readonly ageGroups: AgeGroup[] = [
    { min: 0, max: 2, name: 'Infants' },
    { min: 3, max: 5, name: 'Toddlers' },
    { min: 6, max: 8, name: 'Early Elementary' },
    { min: 9, max: 12, name: 'Late Elementary' },
    { min: 13, max: 17, name: 'Teens' },
  ];

  private readonly inappropriateKeywords = [
    'weapon', 'gun', 'knife', 'violent', 'scary', 'horror',
    'inappropriate', 'adult', 'mature', 'explicit'
  ];

  private readonly educationalKeywords = [
    'educational', 'learning', 'teach', 'develop', 'skill',
    'creative', 'build', 'math', 'science', 'reading'
  ];

  async checkContentSafety(
    title: string,
    description: string,
    category: string,
    tags: string[]
  ): Promise<SafetyCheck> {
    const content = `${title} ${description} ${category} ${tags.join(' ')}`.toLowerCase();
    
    // Check for inappropriate content
    for (const keyword of this.inappropriateKeywords) {
      if (content.includes(keyword)) {
        return {
          isAppropriate: false,
          reason: `Contains inappropriate keyword: ${keyword}`
        };
      }
    }

    // Check educational value
    const hasEducationalValue = this.educationalKeywords.some(keyword => 
      content.includes(keyword)
    );

    return {
      isAppropriate: true,
      reason: hasEducationalValue ? 'Educational content detected' : 'Content appears safe',
      suggestedAgeGroup: this.determineAgeGroup(content, hasEducationalValue)
    };
  }

  private determineAgeGroup(content: string, isEducational: boolean): AgeGroup {
    if (content.includes('infant') || content.includes('baby')) {
      return this.ageGroups[0];
    }
    if (content.includes('toddler') || content.includes('preschool')) {
      return this.ageGroups[1];
    }
    if (content.includes('elementary') || content.includes('school')) {
      return isEducational ? this.ageGroups[2] : this.ageGroups[3];
    }
    return this.ageGroups[4]; // Default to Teens
  }

  filterProductsForAge(products: any[], userAge: number): any[] {
    return products.filter(product => {
      if (!product.age_group) return false;
      const ageGroup = this.ageGroups.find(ag => ag.name === product.age_group);
      return ageGroup && userAge >= ageGroup.min && userAge <= ageGroup.max;
    });
  }

  async analyzeImageSafety(imageUrl: string): Promise<boolean> {
    // Placeholder for AI image analysis
    // In real implementation, integrate with services like Google Vision API
    // or AWS Rekognition for NSFW detection
    return true;
  }

  async getAgeGroups() {
    const ageGroups = await this.prisma.ageGroup.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' }
    });
    return { success: true, data: ageGroups };
  }

  async getSafetyCertifications() {
    const certifications = await this.prisma.safetyCertification.findMany({
      where: { is_active: true }
    });
    return { success: true, data: certifications };
  }

  async getChildProfiles(userId: number) {
    const profiles = await this.prisma.childProfile.findMany({
      where: {
        parent_id: userId,
        is_active: true
      },
      include: {
        parental_controls: true
      }
    });
    return { success: true, data: profiles };
  }

  async createChildProfile(userId: number, profileData: any) {
    const profile = await this.prisma.childProfile.create({
      data: {
        parent_id: userId,
        name: profileData.name,
        birth_date: new Date(profileData.birth_date),
        gender: profileData.gender,
        interests: profileData.interests || [],
        allergies: profileData.allergies || [],
        is_active: true
      }
    });
    return { success: true, data: profile };
  }

  async getParentalControls(userId: number, childId: number) {
    // Verify child belongs to user
    const child = await this.prisma.childProfile.findFirst({
      where: {
        id: childId,
        parent_id: userId
      }
    });

    if (!child) {
      throw new NotFoundException('Child profile not found');
    }

    const controls = await this.prisma.parentalControl.findFirst({
      where: {
        user_id: userId,
        child_profile_id: childId
      }
    });

    return { success: true, data: controls };
  }

  async updateParentalControls(userId: number, childId: number, controlData: any) {
    // Verify child belongs to user
    const child = await this.prisma.childProfile.findFirst({
      where: {
        id: childId,
        parent_id: userId
      }
    });

    if (!child) {
      throw new NotFoundException('Child profile not found');
    }

    const controls = await this.prisma.parentalControl.upsert({
      where: {
        user_id_child_profile_id: {
          user_id: userId,
          child_profile_id: childId
        }
      },
      update: {
        spending_limit: controlData.spending_limit,
        daily_spending_limit: controlData.daily_spending_limit,
        allowed_categories: controlData.allowed_categories || [],
        blocked_categories: controlData.blocked_categories || [],
        time_restrictions: controlData.time_restrictions || {},
        updatedAt: new Date()
      },
      create: {
        user_id: userId,
        child_profile_id: childId,
        spending_limit: controlData.spending_limit,
        daily_spending_limit: controlData.daily_spending_limit,
        allowed_categories: controlData.allowed_categories || [],
        blocked_categories: controlData.blocked_categories || [],
        time_restrictions: controlData.time_restrictions || {},
        is_active: true
      }
    });

    return { success: true, data: controls };
  }

  async getAgeAppropriateProducts(age: number, category?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {
      is_approved: true,
      is_active: true,
      OR: [
        {
          recommended_age_min: { lte: age },
          recommended_age_max: { gte: age }
        },
        {
          recommended_age_min: null,
          recommended_age_max: null
        }
      ]
    };

    if (category) {
      whereClause.category = {
        name: { contains: category, mode: 'insensitive' }
      };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          product_image: true,
          product_certifications: {
            include: {
              certification: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.product.count({ where: whereClause })
    ]);

    return {
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getSafetyReports() {
    // This would typically fetch safety incident reports
    // For now, return placeholder data
    return {
      success: true,
      data: {
        totalReports: 0,
        resolvedReports: 0,
        pendingReports: 0,
        recentReports: []
      }
    };
  }

  async createSafetyCertification(certificationData: any) {
    const certification = await this.prisma.safetyCertification.create({
      data: {
        name: certificationData.name,
        code: certificationData.code,
        description: certificationData.description,
        required_for_age: certificationData.required_for_age,
        logo: certificationData.logo,
        is_active: true
      }
    });

    return { success: true, data: certification };
  }
}
