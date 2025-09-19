import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

@Injectable()
export class UploadService {
  private readonly uploadPath: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH', './uploads');
    this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ];
  }

  async uploadProductImages(files: Express.Multer.File[], productId?: number): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Validate files
    this.validateFiles(files);

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(this.uploadPath, 'products');
    await this.ensureDirectoryExists(uploadDir);

    const uploadedFiles: string[] = [];

    for (const file of files) {
      try {
        const fileName = this.generateFileName(file.originalname);
        const filePath = path.join(uploadDir, fileName);
        
        // Write file to disk
        await writeFile(filePath, file.buffer);
        
        // Return relative path for database storage
        const relativePath = `/uploads/products/${fileName}`;
        uploadedFiles.push(relativePath);
      } catch (error) {
        // Clean up any uploaded files if one fails
        await this.cleanupFiles(uploadedFiles);
        throw new BadRequestException(`Failed to upload file: ${file.originalname}`);
      }
    }

    return uploadedFiles;
  }

  async uploadSingleImage(file: Express.Multer.File, folder: string = 'general'): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    this.validateFiles([file]);

    const uploadDir = path.join(this.uploadPath, folder);
    await this.ensureDirectoryExists(uploadDir);

    const fileName = this.generateFileName(file.originalname);
    const filePath = path.join(uploadDir, fileName);
    
    await writeFile(filePath, file.buffer);
    
    return `/uploads/${folder}/${fileName}`;
  }

  private validateFiles(files: Express.Multer.File[]): void {
    for (const file of files) {
      // Check file size
      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File ${file.originalname} is too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`
        );
      }

      // Check mime type
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File ${file.originalname} has invalid type. Allowed types: ${this.allowedMimeTypes.join(', ')}`
        );
      }
    }
  }

  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName).toLowerCase();
    
    return `${timestamp}-${randomString}${extension}`;
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw new BadRequestException('Failed to create upload directory');
      }
    }
  }

  private async cleanupFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (error) {
        console.error(`Failed to cleanup file: ${filePath}`, error);
      }
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
      return false;
    }
  }

  getFileUrl(filePath: string): string {
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:4000');
    return `${baseUrl}${filePath}`;
  }
}
