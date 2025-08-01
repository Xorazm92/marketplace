import { Controller, Get, Param, Res, NotFoundException, Header, Options } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('uploads')
export class UploadsController {
  @Options(':filename')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  @Header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  async handleOptions(@Res() res: Response) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).send();
  }

  @Get(':filename')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  @Header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'public', 'uploads', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    // CORS header'larni qo'shish
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return res.sendFile(filePath);
  }
}
