// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { CacheStrategyService } from '../cache/cache-strategy.service';

interface ImageVariant {
  width: number;
  height?: number;
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
}

interface CDNConfig {
  bucket: string;
  region: string;
  cloudFrontDomain: string;
  accessKeyId: string;
  secretAccessKey: string;
}

@Injectable()
export class CDNOptimizerService {
  private readonly logger = new Logger(CDNOptimizerService.name);
  private readonly s3Client: S3Client;
  private readonly cdnConfig: CDNConfig;

  private readonly IMAGE_VARIANTS: ImageVariant[] = [
    { width: 50, height: 50, quality: 80, format: 'webp' },    // Thumbnail
    { width: 200, height: 200, quality: 85, format: 'webp' },  // Small
    { width: 400, height: 400, quality: 90, format: 'webp' },  // Medium
    { width: 800, height: 800, quality: 90, format: 'webp' },  // Large
    { width: 1200, height: 1200, quality: 95, format: 'webp' }, // Extra large
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheStrategyService,
  ) {
    this.cdnConfig = {
      bucket: this.configService.get('AWS_S3_BUCKET'),
      region: this.configService.get('AWS_S3_REGION'),
      cloudFrontDomain: this.configService.get('CLOUDFRONT_DOMAIN'),
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    };

    this.s3Client = new S3Client({
      region: this.cdnConfig.region,
      credentials: {
        accessKeyId: this.cdnConfig.accessKeyId,
        secretAccessKey: this.cdnConfig.secretAccessKey,
      },
    });
  }

  // Upload and optimize images with multiple variants
  async uploadOptimizedImage(
    file: Express.Multer.File,
    folder: string = 'products'
  ): Promise<string[]> {
    const originalName = file.originalname.split('.')[0];
    const urls: string[] = [];

    try {
      // Process each variant
      for (const variant of this.IMAGE_VARIANTS) {
        const buffer = await this.processImage(file.buffer, variant);
        const fileName = `${folder}/${originalName}-${variant.width}x${variant.height}.${variant.format}`;
        
        const url = await this.uploadToS3(buffer, fileName, variant.format);
        urls.push(url);
        
        // Cache the URL
        await this.cacheService.setL4(`image:${fileName}`, url, 86400);
      }

      this.logger.log(`Uploaded ${urls.length} image variants for ${originalName}`);
      return urls;
    } catch (error) {
      this.logger.error('Error uploading optimized image:', error);
      throw error;
    }
  }

  // Generate CDN URLs with optimization parameters
  getOptimizedImageUrl(
    imagePath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
      crop?: 'fill' | 'fit' | 'scale';
    } = {}
  ): string {
    const params = new URLSearchParams();
    
    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.format) params.append('f', options.format);
    if (options.crop) params.append('c', options.crop);

    const baseUrl = `https://${this.cdnConfig.cloudFrontDomain}/${imagePath}`;
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }

  // Responsive image generation
  async generateResponsiveImages(
    buffer: Buffer,
    filename: string,
    folder: string = 'products'
  ): Promise<Record<string, string>> {
    const urls: Record<string, string> = {};

    try {
      for (const variant of this.IMAGE_VARIANTS) {
        const processedBuffer = await this.processImage(buffer, variant);
        const key = `${variant.width}x${variant.height}`;
        const fileName = `${folder}/${filename}-${key}.${variant.format}`;
        
        const url = await this.uploadToS3(processedBuffer, fileName, variant.format);
        urls[key] = url;
        
        // Cache responsive URLs
        await this.cacheService.setL4(`responsive:${filename}:${key}`, url, 86400);
      }

      return urls;
    } catch (error) {
      this.logger.error('Error generating responsive images:', error);
      throw error;
    }
  }

  // Image processing with Sharp
  private async processImage(buffer: Buffer, variant: ImageVariant): Promise<Buffer> {
    let processed = sharp(buffer);

    if (variant.width && variant.height) {
      processed = processed.resize(variant.width, variant.height, {
        fit: 'cover',
        position: 'center',
      });
    } else if (variant.width) {
      processed = processed.resize(variant.width, null, {
        fit: 'inside',
      });
    }

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

  // Upload to S3 with proper metadata
  private async uploadToS3(buffer: Buffer, fileName: string, format: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.cdnConfig.bucket,
      Key: fileName,
      Body: buffer,
      ContentType: `image/${format}`,
      CacheControl: 'public, max-age=31536000', // 1 year
      ACL: 'public-read',
    });

    await this.s3Client.send(command);
    return `https://${this.cdnConfig.cloudFrontDomain}/${fileName}`;
  }

  // Generate signed URLs for secure access
  async getSignedUrl(fileName: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.cdnConfig.bucket,
      Key: fileName,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  // Image optimization for different devices
  getDeviceOptimizedImage(imagePath: string, deviceType: 'mobile' | 'tablet' | 'desktop') {
    const sizes = {
      mobile: { width: 400, height: 400 },
      tablet: { width: 600, height: 600 },
      desktop: { width: 800, height: 800 },
    };

    return this.getOptimizedImageUrl(imagePath, sizes[deviceType]);
  }

  // Lazy loading placeholder generation
  async generatePlaceholder(imagePath: string): Promise<string> {
    const cacheKey = `placeholder:${imagePath}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Generate 20x20 blurred placeholder
        const buffer = await this.processImage(
          Buffer.from('placeholder'), // Replace with actual image buffer
          { width: 20, height: 20, quality: 20, format: 'webp' }
        );
        
        return `data:image/webp;base64,${buffer.toString('base64')}`;
      },
      'L4',
      86400
    );
  }

  // Image CDN URL builder
  buildImageUrl(imagePath: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    device?: 'mobile' | 'tablet' | 'desktop';
  } = {}): string {
    const params = new URLSearchParams();
    
    if (options.device) {
      const deviceSizes = {
        mobile: { width: 400, height: 400 },
        tablet: { width: 600, height: 600 },
        desktop: { width: 800, height: 800 },
      };
      Object.assign(options, deviceSizes[options.device]);
    }

    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.format) params.append('f', options.format);

    const baseUrl = `https://${this.cdnConfig.cloudFrontDomain}/${imagePath}`;
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }

  // Cache invalidation for updated images
  async invalidateImageCache(imagePath: string): Promise<void> {
    const patterns = [
      `image:${imagePath}`,
      `responsive:${imagePath}:*`,
      `placeholder:${imagePath}`,
    ];

    for (const pattern of patterns) {
      const keys = await this.cacheService.keys(pattern);
      if (keys.length > 0) {
        await this.cacheService.del(...keys);
      }
    }

    this.logger.log(`Invalidated cache for image: ${imagePath}`);
  }

  // Performance monitoring
  async getCDNMetrics(): Promise<Record<string, number>> {
    const metrics = {
      totalImages: 0,
      totalSize: 0,
      cacheHitRatio: 0,
      bandwidthSaved: 0,
    };

    // Implementation would depend on CloudWatch or CDN analytics
    return metrics;
  }
}
