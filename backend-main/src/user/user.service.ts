import { Injectable } from "@nestjs/common";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

import { PasswordService } from "./password.service";
import { UserRepository } from "./user.repository";
import { UserTokenService } from "./user-token.service";


@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly userTokenService: UserTokenService,
    
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashed_password = await this.passwordService.encrypt(
      createUserDto.password
    );

    const newUser = await this.userRepository.create({
      data: {
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        password: hashed_password,
        phone_number: {
          create: {
            phone_number: createUserDto.phone_number,
            is_main: true,
          },
        },
      },
      include: {
        phone_number: true,
      },
    });

    return newUser;
  }

  async findAll() {
    return this.userRepository.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        birth_date: true,
        profile_img: true,
        is_active: true,
        is_premium: true,
        last_online: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
        product: {
          include: {
            product_image: true,
            brand: true,
            
          },
        },
      },
    });
  }

  async findUserByPhoneNumber(phone_number: string): Promise<any> {
    return this.userRepository.findPhoneNumberFirst({
      where: { phone_number, is_main: true },
      include: { user: true },
    });
  }

  async updateUserRefreshToken(id: number, token: string | undefined) {
    return await this.userTokenService.persistRefreshToken(id, token);
  }

  async findOne(id: number) {
    return await this.userRepository.findUnique({
      where: { id },
      include: {
        phone_number: true,
        address: true,
        email: true,
        product: {
          include: {
            product_image: true,
            brand: true,
            
            
            currency: true,
          },
        },
      },
    });
  }

  async findOneById(id: number) {
    return await this.userRepository.findUnique({ where: { id } });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    image: any
  ) {
    const data: any = {};

    if (updateUserDto?.first_name) {
      data.first_name = updateUserDto.first_name;
    }

    if (updateUserDto?.last_name) {
      data.last_name = updateUserDto.last_name;
    }

    if (updateUserDto?.birth_date) {
      data.birth_date = updateUserDto.birth_date;
    }

    if (updateUserDto?.password) {
      data.password = await this.passwordService.encrypt(updateUserDto.password);
    }

    if (image) {
      data.profile_img = image.filename;
    }
    await this.userRepository.update({
      where: { id },
      data,
    });

    return {
      message: "Successfully updated user,",
      data: {},
      status_code: 200,
    };
  }

  async remove(id: number) {
    return await this.userRepository.delete({ where: { id } });
  }

  async blockUserById(userId: number) {
    return this.userRepository.blockUserById(userId);
  }

  async searchUsers(query: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      OR: [
        { first_name: { contains: query, mode: "insensitive" } },
        { last_name: { contains: query, mode: "insensitive" } },
        {
          phone_number: {
            some: {
              phone_number: { contains: query, mode: "insensitive" },
            },
          },
        },
      ],
    };

    const [users, total] = await Promise.all([
      this.userRepository.findMany({
        where: whereClause,
        include: { phone_number: true },
        skip,
        take: limit,
      }),
      this.userRepository.count({ where: whereClause }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
