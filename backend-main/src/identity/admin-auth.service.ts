import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';
import { normalizeUzPhone } from './phone';
import { AdminLoginDto, CreateAdminDto } from './dto';

const PUBLIC_ADMIN_SELECT = {
  id: true,
  phone_number: true,
  first_name: true,
  last_name: true,
  email: true,
  role: true,
  is_active: true,
  createdAt: true,
} satisfies Prisma.AdminSelect;

// Mavjud bo'lmagan telefon uchun ham bcrypt ishlaydi: javob vaqti bo'yicha
// qaysi raqam admin ekanini aniqlab bo'lmasin.
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer', 10);

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  async login(dto: AdminLoginDto) {
    const invalid = new UnauthorizedException("Telefon yoki parol noto'g'ri");
    let phone: string;
    try {
      phone = normalizeUzPhone(dto.phone_number);
    } catch {
      throw invalid;
    }
    const admin = await this.prisma.admin.findUnique({ where: { phone_number: phone } });
    const ok = await bcrypt.compare(dto.password, admin?.hashed_password ?? DUMMY_HASH);
    if (!admin || !ok) throw invalid;
    if (!admin.is_active) throw new ForbiddenException('Hisob faol emas');

    const pair = await this.issue(admin.id, admin.role);
    const profile = await this.prisma.admin.findUnique({ where: { id: admin.id }, select: PUBLIC_ADMIN_SELECT });
    return { admin: profile, ...pair };
  }

  async refresh(refreshToken: string) {
    const principal = this.tokens.verifyRefresh(refreshToken, 'admin');
    const admin = await this.prisma.admin.findUnique({ where: { id: principal.sub } });
    if (!admin || !admin.is_active || !TokenService.matches(refreshToken, admin.hashed_refresh_token)) {
      throw new UnauthorizedException('Qaytadan kiring');
    }
    return this.issue(admin.id, admin.role);
  }

  async logout(adminId: number) {
    await this.prisma.admin.update({ where: { id: adminId }, data: { hashed_refresh_token: null } });
    return { success: true };
  }

  me(adminId: number) {
    return this.prisma.admin.findUniqueOrThrow({ where: { id: adminId }, select: PUBLIC_ADMIN_SELECT });
  }

  list() {
    return this.prisma.admin.findMany({ select: PUBLIC_ADMIN_SELECT, orderBy: { id: 'asc' } });
  }

  async create(dto: CreateAdminDto) {
    const phone = normalizeUzPhone(dto.phone_number);
    try {
      return await this.prisma.admin.create({
        data: {
          phone_number: phone,
          first_name: dto.first_name,
          last_name: dto.last_name,
          role: dto.role,
          is_active: true,
          hashed_password: await bcrypt.hash(dto.password, 10),
        },
        select: PUBLIC_ADMIN_SELECT,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Bu telefon raqamli admin allaqachon bor');
      }
      throw error;
    }
  }

  async setActive(actorId: number, adminId: number, isActive: boolean) {
    if (actorId === adminId) throw new BadRequestException("O'z hisobingizni o'chira olmaysiz");
    return this.prisma.admin.update({
      where: { id: adminId },
      // O'chirilgan admin refresh qila olmasin.
      data: { is_active: isActive, ...(isActive ? {} : { hashed_refresh_token: null }) },
      select: PUBLIC_ADMIN_SELECT,
    });
  }

  private async issue(adminId: number, role: string) {
    const pair = this.tokens.issue({ sub: adminId, kind: 'admin', role });
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { hashed_refresh_token: TokenService.fingerprint(pair.refresh_token) },
    });
    return pair;
  }
}
