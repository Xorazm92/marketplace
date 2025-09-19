import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { UploadService } from './upload.service';
import * as path from 'path';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('product-images')
  @ApiOperation({ summary: 'Upload multiple product images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 files
  async uploadProductImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadedPaths = await this.uploadService.uploadProductImages(files);
    
    return {
      message: 'Images uploaded successfully',
      files: uploadedPaths.map(path => ({
        url: path,
        fullUrl: this.uploadService.getFileUrl(path)
      })),
      count: uploadedPaths.length
    };
  }

  @Post('single-image')
  @ApiOperation({ summary: 'Upload single image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          description: 'Upload folder (optional)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async uploadSingleImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('folder') folder?: string
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const uploadedPath = await this.uploadService.uploadSingleImage(file, folder);
    
    return {
      message: 'Image uploaded successfully',
      url: uploadedPath,
      fullUrl: this.uploadService.getFileUrl(uploadedPath)
    };
  }

  @Get('serve/:folder/:filename')
  @ApiOperation({ summary: 'Serve uploaded files' })
  async serveFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    const filePath = path.join(process.cwd(), 'uploads', folder, filename);
    return res.sendFile(filePath);
  }
}
