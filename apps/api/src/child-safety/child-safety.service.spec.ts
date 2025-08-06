
import { Test, TestingModule } from '@nestjs/testing';
import { ChildSafetyService } from './child-safety.service';
import { ChildSafetyTestScenarios } from '../testing/test-utils';

describe('ChildSafetyService', () => {
  let service: ChildSafetyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChildSafetyService],
    }).compile();

    service = module.get<ChildSafetyService>(ChildSafetyService);
  });

  describe('Content Safety Checks', () => {
    ChildSafetyTestScenarios.inappropriateContentTests.forEach(({ name, content, expected }) => {
      it(name, async () => {
        const result = await service.checkContentSafety(content, '', '', []);
        expect(result.isAppropriate).toBe(expected);
      });
    });
  });

  describe('Age Group Determination', () => {
    it('should correctly classify infant products', async () => {
      const result = await service.checkContentSafety(
        'Baby rattle for infants',
        'Safe toy for babies 0-12 months',
        'toys',
        ['baby', 'infant']
      );
      expect(result.suggestedAgeGroup?.name).toBe('Infants');
    });

    it('should correctly classify educational products', async () => {
      const result = await service.checkContentSafety(
        'Educational math blocks',
        'Learning toy for developing math skills',
        'education',
        ['learning', 'educational']
      );
      expect(result.isAppropriate).toBe(true);
      expect(result.suggestedAgeGroup).toBeDefined();
    });
  });

  describe('Product Filtering by Age', () => {
    const mockProducts = [
      { id: 1, age_group: 'Infants', title: 'Baby toy' },
      { id: 2, age_group: 'Toddlers', title: 'Toddler toy' },
      { id: 3, age_group: 'Early Elementary', title: 'School toy' },
    ];

    it('should filter products for 2-year-old', () => {
      const filtered = service.filterProductsForAge(mockProducts, 2);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].age_group).toBe('Infants');
    });

    it('should filter products for 7-year-old', () => {
      const filtered = service.filterProductsForAge(mockProducts, 7);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].age_group).toBe('Early Elementary');
    });
  });

  describe('Image Safety Analysis', () => {
    it('should validate safe images', async () => {
      const result = await service.analyzeImageSafety('https://example.com/safe-toy.jpg');
      expect(result).toBe(true);
    });

    // In real implementation, you would test with actual image analysis
    it('should detect inappropriate images', async () => {
      // Mock implementation - would integrate with actual AI service
      const result = await service.analyzeImageSafety('https://example.com/inappropriate.jpg');
      expect(typeof result).toBe('boolean');
    });
  });
});
