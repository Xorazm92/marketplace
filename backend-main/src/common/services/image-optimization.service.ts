import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

export interface ImageResizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface OptimizedImage {
  originalPath: string;
  optimizedPath: string;
  thumbnailPath: string;
  webpPath: string;
  size: {
    original: number;
    optimized: number;
    thumbnail: number;
    webp: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
}

@Injectable()
export class ImageOptimizationService {
  private readonly logger = new Logger(ImageOptimizationService.name);
  private readonly uploadPath: string;
  private readonly optimizedPath: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH') || './uploads';
    this.optimizedPath = path.join(this.uploadPath, 'optimized');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    const directories = [
      this.uploadPath,
      this.optimizedPath,
      path.join(this.optimizedPath, 'thumbnails'),
      path.join(this.optimizedPath, 'webp'),
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async optimizeImage(
    inputPath: string,
    options: ImageResizeOptions = {},
  ): Promise<OptimizedImage> {
    try {
      const {
        width = 800,
        height = 600,
        quality = 80,
        format = 'jpeg',
        fit = 'cover',
      } = options;

      const filename = path.basename(inputPath, path.extname(inputPath));
      const timestamp = Date.now();

      // Paths for different versions
      const optimizedPath = path.join(
        this.optimizedPath,
        `${filename}_${timestamp}_optimized.${format}`,
      );
      const thumbnailPath = path.join(
        this.optimizedPath,
        'thumbnails',
        `${filename}_${timestamp}_thumb.${format}`,
      );
      const webpPath = path.join(
        this.optimizedPath,
        'webp',
        `${filename}_${timestamp}.webp`,
      );

      // Get original file size
      const originalStats = fs.statSync(inputPath);
      const originalSize = originalStats.size;

      // Get image metadata
      const metadata = await sharp(inputPath).metadata();

      // Create optimized version
      await sharp(inputPath)
        .resize(width, height, { fit })
        .jpeg({ quality })
        .toFile(optimizedPath);

      // Create thumbnail (200x200)
      await sharp(inputPath)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toFile(thumbnailPath);

      // Create WebP version
      await sharp(inputPath)
        .resize(width, height, { fit })
        .webp({ quality })
        .toFile(webpPath);

      // Get file sizes
      const optimizedStats = fs.statSync(optimizedPath);
      const thumbnailStats = fs.statSync(thumbnailPath);
      const webpStats = fs.statSync(webpPath);

      const result: OptimizedImage = {
        originalPath: inputPath,
        optimizedPath,
        thumbnailPath,
        webpPath,
        size: {
          original: originalSize,
          optimized: optimizedStats.size,
          thumbnail: thumbnailStats.size,
          webp: webpStats.size,
        },
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0,
        },
      };

      this.logger.log(
        `Image optimized: ${filename} (${originalSize} -> ${optimizedStats.size} bytes, ${Math.round(((originalSize - optimizedStats.size) / originalSize) * 100)}% reduction)`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to optimize image: ${inputPath}`, error);
      throw error;
    }
  }

  async createResponsiveImages(
    inputPath: string,
    sizes: number[] = [400, 800, 1200, 1600],
  ): Promise<{ [size: number]: string }> {
    const filename = path.basename(inputPath, path.extname(inputPath));
    const timestamp = Date.now();
    const responsiveImages: { [size: number]: string } = {};

    for (const size of sizes) {
      const outputPath = path.join(
        this.optimizedPath,
        `${filename}_${timestamp}_${size}w.jpeg`,
      );

      await sharp(inputPath)
        .resize(size, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      responsiveImages[size] = outputPath;
    }

    this.logger.log(`Created responsive images for: ${filename}`);
    return responsiveImages;
  }

  async generateImageSrcSet(
    inputPath: string,
    baseUrl: string,
    sizes: number[] = [400, 800, 1200, 1600],
  ): Promise<string> {
    const responsiveImages = await this.createResponsiveImages(inputPath, sizes);
    
    const srcSetEntries = Object.entries(responsiveImages).map(
      ([size, path]) => {
        const relativePath = path.replace(this.uploadPath, '');
        return `${baseUrl}${relativePath} ${size}w`;
      },
    );

    return srcSetEntries.join(', ');
  }

  async compressImage(
    inputPath: string,
    quality: number = 80,
    format: 'jpeg' | 'png' | 'webp' = 'jpeg',
  ): Promise<string> {
    const filename = path.basename(inputPath, path.extname(inputPath));
    const timestamp = Date.now();
    const outputPath = path.join(
      this.optimizedPath,
      `${filename}_${timestamp}_compressed.${format}`,
    );

    let pipeline = sharp(inputPath);

    switch (format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality });
        break;
      case 'png':
        pipeline = pipeline.png({ quality });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
    }

    await pipeline.toFile(outputPath);

    this.logger.log(`Image compressed: ${filename} -> ${format} (quality: ${quality})`);
    return outputPath;
  }

  async watermarkImage(
    inputPath: string,
    watermarkPath: string,
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' = 'bottom-right',
  ): Promise<string> {
    const filename = path.basename(inputPath, path.extname(inputPath));
    const timestamp = Date.now();
    const outputPath = path.join(
      this.optimizedPath,
      `${filename}_${timestamp}_watermarked.jpeg`,
    );

    const image = sharp(inputPath);
    const { width, height } = await image.metadata();

    let gravity: string;
    switch (position) {
      case 'top-left':
        gravity = 'northwest';
        break;
      case 'top-right':
        gravity = 'northeast';
        break;
      case 'bottom-left':
        gravity = 'southwest';
        break;
      case 'bottom-right':
        gravity = 'southeast';
        break;
      case 'center':
        gravity = 'center';
        break;
      default:
        gravity = 'southeast';
    }

    await image
      .composite([
        {
          input: watermarkPath,
          gravity: gravity as any,
          blend: 'over',
        },
      ])
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    this.logger.log(`Watermark applied to: ${filename}`);
    return outputPath;
  }

  async cleanupOldImages(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const directories = [
      this.optimizedPath,
      path.join(this.optimizedPath, 'thumbnails'),
      path.join(this.optimizedPath, 'webp'),
    ];

    let deletedCount = 0;

    for (const directory of directories) {
      if (!fs.existsSync(directory)) continue;

      const files = fs.readdirSync(directory);
      
      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    }

    this.logger.log(`Cleaned up ${deletedCount} old optimized images`);
  }

  getImageInfo(imagePath: string): Promise<sharp.Metadata> {
    return sharp(imagePath).metadata();
  }

  async validateImage(imagePath: string): Promise<boolean> {
    try {
      const metadata = await this.getImageInfo(imagePath);
      return !!(metadata.width && metadata.height);
    } catch (error) {
      return false;
    }
  }
}
