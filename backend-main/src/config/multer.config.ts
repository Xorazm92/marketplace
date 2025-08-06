import { diskStorage } from 'multer';
import * as path from 'path';

export const multerOptions = {
  storage: diskStorage({
    destination: './public/uploads',
    filename: (req, file, callback) => {
      const fileExtName = path.extname(file.originalname);
      const randomName = Math.random().toString(36).substring(2, 15);
      callback(null, `${randomName}${fileExtName}`);

    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024
  }
};
