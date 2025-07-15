
import { Injectable } from '@nestjs/common';

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
    const hasEducationalValue = this.educationalKeywords.some(
      keyword => content.includes(keyword)
    );

    return {
      isAppropriate: true,
      suggestedAgeGroup: this.determineAgeGroup(content, hasEducationalValue)
    };
  }

  private determineAgeGroup(content: string, hasEducationalValue: boolean): AgeGroup {
    // Simple AI-like logic for age determination
    if (content.includes('baby') || content.includes('infant')) {
      return this.ageGroups[0];
    }
    if (content.includes('toddler') || content.includes('preschool')) {
      return this.ageGroups[1];
    }
    if (content.includes('elementary') || content.includes('school')) {
      return hasEducationalValue ? this.ageGroups[2] : this.ageGroups[3];
    }
    return this.ageGroups[3]; // Default to late elementary
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
}
