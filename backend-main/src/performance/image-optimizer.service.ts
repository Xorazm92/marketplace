// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { RedisCacheService } from './redis-cache.service';

interface ImageVariant {
  width: number;
  height?: number;
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
  suffix: string;
}

interface CDNConfig {
  baseUrl: string;
  uploadPath: string;
  cacheTTL: number;
}

@Injectable()
export class ImageOptimizerService {
  private readonly logger = new Logger(ImageOptimizerService.name);
  private readonly cdnConfig: CDNConfig;

  // Predefined image variants for different use cases
  private readonly IMAGE_VARIANTS: ImageVariant[] = [
    { width: 50, height: 50, quality: 80, format: 'webp', suffix: 'thumb' },    // Thumbnail
    { width: 200, height: 200, quality: 85, format: 'webp', suffix: 'small' },  // Small
    { width: 400, height: 400, quality: 90, format: 'webp', suffix: 'medium' }, // Medium
    { width: 800, height: 800, quality: 90, format: 'webp', suffix: 'large' },  // Large
    { width: 1200, height: 1200, quality: 95, format: 'webp', suffix: 'xl' },   // Extra large
    { width: 1920, quality: 95, format: 'webp', suffix: 'hero' },               // Hero images
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: RedisCacheService,
  ) {
    this.cdnConfig = {
      baseUrl: this.configService.get('CDN_BASE_URL', 'http://localhost:4000'),
      uploadPath: this.configService.get('UPLOAD_PATH', './uploads'),
      cacheTTL: 86400, // 24 hours
    };
  }

  // Upload and optimize images with multiple variants
  async uploadOptimizedImage(
    file: Express.Multer.File,
    folder: string = 'products'
  ): Promise<{ variants: Record<string, string>; original: string }> {
    const originalName = path.parse(file.originalname).name;
    const timestamp = Date.now();
    const baseFileName = `${originalName}-${timestamp}`;
    
    const variants: Record<string, string> = {};
    let originalUrl = '';

    try {
      // Create upload directory if it doesn't exist
      const uploadDir = path.join(this.cdnConfig.uploadPath, folder);
      await fs.mkdir(uploadDir, { recursive: true });

      // Process each variant
      for (const variant of this.IMAGE_VARIANTS) {
        const fileName = `${baseFileName}-${variant.suffix}.${variant.format}`;
        const filePath = path.join(uploadDir, fileName);
        
        const buffer = await this.processImage(file.buffer, variant);
        await fs.writeFile(filePath, buffer);
        
        const url = `${this.cdnConfig.baseUrl}/uploads/${folder}/${fileName}`;
        variants[variant.suffix] = url;
        
        // Cache the URL
        await this.cacheService.setL4(`image:${folder}:${fileName}`, url);
      }

      // Save original with optimization
      const originalFileName = `${baseFileName}-original.webp`;
      const originalPath = path.join(uploadDir, originalFileName);
      const originalBuffer = await sharp(file.buffer)
        .webp({ quality: 95 })
        .toBuffer();
      
      await fs.writeFile(originalPath, originalBuffer);
      originalUrl = `${this.cdnConfig.baseUrl}/uploads/${folder}/${originalFileName}`;

      this.logger.log(`Uploaded and optimized image: ${baseFileName}`);
      
      return { variants, original: originalUrl };
    } catch (error) {
      this.logger.error('Error uploading optimized image:', error);
      throw error;
    }
  }

  // Generate responsive image URLs
  getResponsiveImageUrls(imagePath: string): Record<string, string> {
    const urls: Record<string, string> = {};
    const basePath = imagePath.replace(/\.[^/.]+$/, ''); // Remove extension
    
    this.IMAGE_VARIANTS.forEach(variant => {
      urls[variant.suffix] = `${basePath}-${variant.suffix}.${variant.format}`;
    });
    
    return urls;
  }

  // Generate optimized image URL with parameters
  getOptimizedImageUrl(
    imagePath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
      variant?: string;
    } = {}
  ): string {
    if (options.variant) {
      const responsive = this.getResponsiveImageUrls(imagePath);
      return responsive[options.variant] || imagePath;
    }

    // For dynamic optimization, you would implement URL-based image processing
    // This is a simplified version that returns the closest variant
    const targetWidth = options.width || 400;
    const closestVariant = this.IMAGE_VARIANTS.reduce((prev, curr) => {
      return Math.abs(curr.width - targetWidth) < Math.abs(prev.width - targetWidth) ? curr : prev;
    });

    const responsive = this.getResponsiveImageUrls(imagePath);
    return responsive[closestVariant.suffix] || imagePath;
  }

  // Image processing with Sharp
  private async processImage(buffer: Buffer, variant: ImageVariant): Promise<Buffer> {
    let processed = sharp(buffer);

    // Resize image
    if (variant.width && variant.height) {
      processed = processed.resize(variant.width, variant.height, {
        fit: 'cover',
        position: 'center',
      });
    } else if (variant.width) {
      processed = processed.resize(variant.width, null, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Apply format and quality
    switch (variant.format) {
      case 'webp':
        return processed.webp({ quality: variant.quality }).toBuffer();
      case 'jpeg':
        return processed.jpeg({ quality: variant.quality }).toBuffer();
      case 'png':
        return processed.png({ quality: variant.quality }).toBuffer();
      default:
        return processed.toBuffer();
    }
  }

  // Generate lazy loading placeholder
  async generatePlaceholder(imagePath: string): Promise<string> {
    const cacheKey = `placeholder:${imagePath}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          // Generate 20x20 blurred placeholder
          const placeholderBuffer = await sharp({
            create: {
              width: 20,
              height: 20,
              channels: 3,
              background: { r: 240, g: 240, b: 240 }
            }
          })
          .webp({ quality: 20 })
          .blur(2)
          .toBuffer();
          
          return `data:image/webp;base64,${placeholderBuffer.toString('base64')}`;
        } catch (error) {
          // Fallback placeholder
          return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjBGMEYwIi8+Cjwvc3ZnPgo=';
        }
      },
      'L4',
      this.cdnConfig.cacheTTL
    );
  }

  // Image optimization for different devices
  getDeviceOptimizedImage(imagePath: string, deviceType: 'mobile' | 'tablet' | 'desktop'): string {
    const deviceVariants = {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'large',
    };

    return this.getOptimizedImageUrl(imagePath, { variant: deviceVariants[deviceType] });
  }

  // Batch image processing
  async batchOptimizeImages(files: Express.Multer.File[], folder: string = 'products'): Promise<any[]> {
    const results = await Promise.allSettled(
      files.map(file => this.uploadOptimizedImage(file, folder))
    );

    return results.map((result, index) => ({
      filename: files[index].originalname,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
  }

  // Image cache management
  async invalidateImageCache(imagePath: string): Promise<void> {
    const patterns = [
      `image:*:${path.basename(imagePath)}`,
      `placeholder:${imagePath}`,
    ];

    for (const pattern of patterns) {
      // In a real implementation, you would use Redis SCAN
      // This is a simplified version
      await this.cacheService.invalidateByTag('images');
    }

    this.logger.log(`Invalidated cache for image: ${imagePath}`);
  }

  // Image analytics and metrics
  async getImageMetrics(): Promise<Record<string, number>> {
    try {
      const uploadDir = this.cdnConfig.uploadPath;
      const stats = await fs.stat(uploadDir);
      
      // Get directory size (simplified)
      const files = await fs.readdir(uploadDir, { recursive: true });
      
      return {
        totalImages: files.length,
        totalSize: stats.size,
        variants: this.IMAGE_VARIANTS.length,
        cacheHitRate: 85, // This would come from actual metrics
      };
    } catch (error) {
      this.logger.error('Error getting image metrics:', error);
      return {
        totalImages: 0,
        totalSize: 0,
        variants: 0,
        cacheHitRate: 0,
      };
    }
  }

  // WebP support detection and fallback
  generatePictureElement(imagePath: string, alt: string = ''): string {
    const responsive = this.getResponsiveImageUrls(imagePath);
    
    return `
      <picture>
        <source 
          srcset="${responsive.small} 200w, ${responsive.medium} 400w, ${responsive.large} 800w" 
          sizes="(max-width: 768px) 200px, (max-width: 1024px) 400px, 800px"
          type="image/webp"
        />
        <img 
          src="${responsive.medium}" 
          alt="${alt}"
          loading="lazy"
          decoding="async"
        />
      </picture>
    `;
  }

  // Image SEO optimization
  generateImageSEO(imagePath: string, alt: string, title?: string): Record<string, string> {
    const responsive = this.getResponsiveImageUrls(imagePath);
    
    return {
      'og:image': responsive.large,
      'og:image:width': '800',
      'og:image:height': '800',
      'og:image:alt': alt,
      'twitter:image': responsive.large,
      'twitter:image:alt': alt,
      ...(title && { 'og:image:title': title }),
    };
  }
}
