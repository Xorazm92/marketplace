import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import { join } from 'path';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async updateProfile(userId: number, first_name: string, profile_img: string) {
    if (profile_img) {
      const oldUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          first_name,
          profile_img,
        },
      });

      if (oldUser?.profile_img) {
        const imageName = oldUser.profile_img.split('/').pop();
        if (imageName) {
          const imagePath = join(
            __dirname,
            '..',
            '..',
            'public',
            'images',
            imageName,
          );
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      }

      return updatedUser;
    }
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        first_name,
      },
    });
  }
  async searchUsers(first_name: string, userId: number) {
    // make sure that users are found that contain part of the fullname
    // and exclude the current user
    return this.prisma.user.findMany({
      where: {
        first_name: {
          contains: first_name,
        },
        id: {
          not: userId,
        },
      },
      include: {
        // phone_number endi User model'da to'g'ridan-to'g'ri field
      }
    });
  }

  async getUsersOfChatroom(chatroomId: number) {
    return this.prisma.user.findMany({
      where: {
        chatrooms: {
          some: {
            id: chatroomId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUser(userId: number) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
}
