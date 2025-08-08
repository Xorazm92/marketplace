// user.repository.ts

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma, User } from "@prisma/client";

/**
 * Repository pattern for User entity.
 * Encapsulates Prisma calls to make the service layer cleaner and easier to mock in tests.
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a new user */
  async create(args: Prisma.UserCreateArgs): Promise<User> {
    return this.prisma.user.create(args);
  }

  /** Find many users with optional select/include */
  async findMany(args: Prisma.UserFindManyArgs): Promise<User[]> {
    return this.prisma.user.findMany(args);
  }

  /** Find a user by unique fields */
  async findUnique(args: Prisma.UserFindUniqueArgs): Promise<User | null> {
    return this.prisma.user.findUnique(args);
  }

  /** Update a user */
  async update(args: Prisma.UserUpdateArgs): Promise<User> {
    return this.prisma.user.update(args);
  }

  /** Delete a user */
  async delete(args: Prisma.UserDeleteArgs): Promise<User> {
    return this.prisma.user.delete(args);
  }

  /** Count users matching criteria */
  async count(args: Prisma.UserCountArgs): Promise<number> {
    return this.prisma.user.count(args);
  }

  /** Find first phone number (used for lookup) */
  async findPhoneNumberFirst(args: Prisma.PhoneNumberFindFirstArgs) {
    return this.prisma.phoneNumber.findFirst(args);
  }

  /** Block a user by setting is_active to false */
  async blockUserById(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { is_active: false },
    });
  }
}
