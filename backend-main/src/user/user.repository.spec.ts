// user.repository.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaService: PrismaService;

  const mockUser: User = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    password: 'hashed',
    is_active: true,
    is_premium: false,
    birth_date: new Date('1990-01-01'),
    profile_img: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    // add other required fields if any
  } as any;

  const prismaMock = {
    user: {
      create: jest.fn().mockResolvedValue(mockUser),
      findMany: jest.fn().mockResolvedValue([mockUser]),
      findUnique: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(mockUser),
      delete: jest.fn().mockResolvedValue(mockUser),
      count: jest.fn().mockResolvedValue(1),
    },
    phoneNumber: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRepository, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('create should call prisma.user.create', async () => {
    const args: Prisma.UserCreateArgs = { data: { first_name: 'John', last_name: 'Doe', password: 'pwd' } } as any;
    const result = await repository.create(args);
    expect(prismaMock.user.create).toHaveBeenCalledWith(args);
    expect(result).toEqual(mockUser);
  });

  it('findMany should call prisma.user.findMany', async () => {
    const args: Prisma.UserFindManyArgs = {} as any;
    const result = await repository.findMany(args);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(args);
    expect(result).toEqual([mockUser]);
  });

  // Additional tests for other methods can be added similarly
});
