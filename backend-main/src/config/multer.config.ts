import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';

// Kengaytma MIME turidan olinadi, foydalanuvchi bergan nomdan emas: ilgari
// `.html` yuklab /uploads orqali backend domenida ochish mumkin edi (stored XSS).
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const UPLOADS_DIR = './public/uploads';

export const multerOptions = {
  storage: diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, callback) => callback(null, `${randomUUID()}${IMAGE_TYPES[file.mimetype]}`),
  }),
  fileFilter: (_req: unknown, file: Express.Multer.File, callback: (error: Error | null, accept: boolean) => void) => {
    if (!IMAGE_TYPES[file.mimetype]) {
      return callback(new BadRequestException('Faqat JPG, PNG yoki WEBP rasm yuklash mumkin'), false);
    }
    callback(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
};
