import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { defaultCurrencyId } from '../common/currency';
import { UPLOADS_DIR } from '../config/multer.config';
import { AdminListProductsQuery, ListProductsQuery, SetStockDto, UpsertProductDto } from './dto';

const PRODUCT_INCLUDE = {
  product_image: { orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }, { id: 'asc' }] },
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, logo: true } },
  inventory: { select: { stock_quantity: true } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof PRODUCT_INCLUDE }>;

// Xaridorga ko'rinadigan mahsulot sharti — bitta joyda, ro'yxat va tafsilot bir xil ishlasin.
const PUBLIC_WHERE: Prisma.ProductWhereInput = { is_active: true, is_deleted: false, is_checked: 'APPROVED' };

// Bazada NOT NULL bo'lgan maydonlar. `null` — "bo'shatish" degani, bular esa bo'shatilmaydi:
// validator (IsOptional) null'ni o'tkazib yuboradi va Prisma 500 berardi.
const REQUIRED_FIELDS = ['title', 'description', 'price', 'min_order_quantity', 'is_active', 'is_featured', 'choking_hazard'] as const;
// Faqat multer yaratgan nomlar (UUID + rasm kengaytmasi) diskdan o'chiriladi.
const UPLOADED_FILE = /^\/uploads\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/;

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listPublic(query: ListProductsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ProductWhereInput = { ...PUBLIC_WHERE };

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { short_description: { contains: query.q, mode: 'insensitive' } },
        { search_keywords: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.category_id) where.category_id = query.category_id;
    if (query.category) where.category = { slug: query.category };
    if (query.brand_id) where.brand_id = query.brand_id;
    if (query.min_price != null || query.max_price != null) {
      where.price = { gte: query.min_price, lte: query.max_price };
    }
    if (query.age_months != null) {
      where.AND = [
        { OR: [{ recommended_age_min: null }, { recommended_age_min: { lte: query.age_months } }] },
        { OR: [{ recommended_age_max: null }, { recommended_age_max: { gte: query.age_months } }] },
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = {
      newest: [{ createdAt: 'desc' as const }],
      price_asc: [{ price: 'asc' as const }],
      price_desc: [{ price: 'desc' as const }],
      popular: [{ view_count: 'desc' as const }, { createdAt: 'desc' as const }],
    }[query.sort ?? 'newest'];

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({ where, include: PRODUCT_INCLUDE, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.product.count({ where }),
    ]);
    return { items: rows.map(toPublic), total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findPublic(idOrSlug: string) {
    const where: Prisma.ProductWhereInput = /^\d+$/.test(idOrSlug)
      ? { ...PUBLIC_WHERE, id: Number(idOrSlug) }
      : { ...PUBLIC_WHERE, slug: idOrSlug };
    const product = await this.prisma.product.findFirst({ where, include: PRODUCT_INCLUDE });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    // Ko'rishlar soni "popular" saralash uchun; javobni kutdirmaydi.
    this.prisma.product.update({ where: { id: product.id }, data: { view_count: { increment: 1 } } }).catch(() => undefined);
    return toPublic(product);
  }

  async listAdmin(query: AdminListProductsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ProductWhereInput = { is_deleted: false };
    if (query.status === 'active') where.is_active = true;
    if (query.status === 'inactive') where.is_active = false;
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { sku: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({ where, include: PRODUCT_INCLUDE, orderBy: { id: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.product.count({ where }),
    ]);
    return { items: rows.map(toAdmin), total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findAdmin(id: number) {
    return toAdmin(await this.getRow(id));
  }

  async create(dto: UpsertProductDto) {
    this.rejectNulls(dto);
    this.checkPrices(dto);
    const product = await this.prisma.product.create({
      data: {
        ...dto,
        currency_id: await defaultCurrencyId(this.prisma),
        slug: makeSlug(dto.title),
        // Mahsulotni admin qo'shadi — alohida moderatsiya bosqichi MVP'da yo'q.
        is_checked: 'APPROVED',
        discount_percentage: discountPercent(dto.price, dto.original_price),
        inventory: { create: { stock_quantity: 0, is_in_stock: false } },
      },
    });
    return this.findAdmin(product.id);
  }

  async update(id: number, dto: Partial<UpsertProductDto>, role?: string) {
    // Narx — pul qarori: moderator kontentni tahrirlaydi, narxni emas (docs/PERMISSIONS.md).
    if (role === 'MODERATOR' && (dto.price !== undefined || dto.original_price !== undefined)) {
      throw new ForbiddenException("Narxni o'zgartirish uchun ruxsatingiz yo'q");
    }
    this.rejectNulls(dto);
    const current = await this.getRow(id);
    const price = dto.price ?? Number(current.price);
    const original = dto.original_price !== undefined ? dto.original_price : current.original_price != null ? Number(current.original_price) : undefined;
    this.checkPrices({ price, original_price: original, ...dto });
    await this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.title && dto.title !== current.title ? { slug: makeSlug(dto.title) } : {}),
        discount_percentage: discountPercent(price, original),
      },
    });
    return this.findAdmin(id);
  }

  // Yumshoq o'chirish: buyurtmalar tarixida mahsulot qatori saqlanishi kerak.
  async remove(id: number) {
    await this.getRow(id);
    await this.prisma.product.update({ where: { id }, data: { is_deleted: true, is_active: false } });
    return { success: true };
  }

  async addImages(id: number, files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('Rasm tanlanmagan');
    const product = await this.getRow(id);
    const hasPrimary = product.product_image.some((image) => image.is_primary);
    await this.prisma.productImage.createMany({
      data: files.map((file, index) => ({
        product_id: id,
        url: `/uploads/${file.filename}`,
        is_primary: !hasPrimary && index === 0,
        sort_order: product.product_image.length + index,
      })),
    });
    return this.findAdmin(id);
  }

  async removeImage(id: number, imageId: number) {
    const image = await this.prisma.productImage.findFirst({ where: { id: imageId, product_id: id } });
    if (!image) throw new NotFoundException('Rasm topilmadi');
    await this.prisma.productImage.delete({ where: { id: image.id } });
    // Avval baza, keyin disk: fayl o'chmay qolsa — faqat ortiqcha fayl, aksi bo'lsa
    // katalogda singan rasm qolardi. Fayl yo'qligi xato emas.
    const file = UPLOADED_FILE.exec(image.url)?.[1];
    if (file) {
      await unlink(join(UPLOADS_DIR, file)).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') this.logger.warn(`Rasm fayli o'chmadi (${file}): ${error.code}`);
      });
    }
    return this.findAdmin(id);
  }

  // Zaxira mutlaq son bilan yoziladi, shuning uchun yozuv shartli: faqat admin ko'rgan
  // qiymat hali o'zgarmagan bo'lsa. Aks holda admin sahifani ochgandan keyin tushgan
  // buyurtmaning kamaytirishi ustidan yozilib, sotilgan dona zaxiraga "qaytib" qolardi.
  async setStock(id: number, dto: SetStockDto) {
    await this.getRow(id);
    await this.prisma.$transaction(async (tx) => {
      const data = { stock_quantity: dto.stock_quantity, is_in_stock: dto.stock_quantity > 0 };
      const { count } = await tx.inventory.updateMany({ where: { product_id: id, stock_quantity: dto.expected_quantity }, data });
      let inventory = await tx.inventory.findUnique({ where: { product_id: id } });
      if (count === 0) {
        if (inventory || dto.expected_quantity !== 0) {
          throw new ConflictException(`Zaxira shu orada o'zgardi: hozir ${inventory?.stock_quantity ?? 0} dona. Sahifani yangilab, qayta kiriting`);
        }
        // Eski mahsulotlarda zaxira qatori bo'lmasligi mumkin (ular 0 deb ko'rsatiladi).
        inventory = await tx.inventory.create({ data: { product_id: id, ...data } });
      }
      await tx.inventoryMovement.create({
        data: { inventory_id: inventory!.id, type: 'ADJUSTMENT', quantity: dto.stock_quantity, reason: `admin: ${dto.expected_quantity} → ${dto.stock_quantity}` },
      });
    });
    return this.findAdmin(id);
  }

  private async getRow(id: number): Promise<ProductRow> {
    const product = await this.prisma.product.findFirst({ where: { id, is_deleted: false }, include: PRODUCT_INCLUDE });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    return product;
  }

  private rejectNulls(dto: Partial<UpsertProductDto>) {
    const empty = REQUIRED_FIELDS.filter((field) => (dto as Record<string, unknown>)[field] === null);
    if (empty.length) throw new BadRequestException(`Bu maydonlar bo'sh bo'lishi mumkin emas: ${empty.join(', ')}`);
  }

  private checkPrices(dto: { price: number; original_price?: number | null; min_order_quantity?: number; max_order_quantity?: number }) {
    if (dto.original_price != null && dto.original_price < dto.price) {
      throw new BadRequestException("Eski narx joriy narxdan kichik bo'lishi mumkin emas");
    }
    if (dto.min_order_quantity && dto.max_order_quantity && dto.max_order_quantity < dto.min_order_quantity) {
      throw new BadRequestException("Maksimal miqdor minimaldan kichik bo'lishi mumkin emas");
    }
  }
}

function makeSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true }).slice(0, 80) || 'mahsulot';
  return `${base}-${randomBytes(3).toString('hex')}`;
}

function discountPercent(price: number, original?: number | null): number {
  return original && original > price ? Math.round((1 - price / original) * 100) : 0;
}

function inStock(product: ProductRow): boolean {
  return product.inventory ? product.inventory.stock_quantity > 0 : product.availability_status !== 'out_of_stock';
}

function toPublic(product: ProductRow) {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    short_description: product.short_description,
    description: product.description,
    price: Number(product.price),
    original_price: product.original_price != null ? Number(product.original_price) : null,
    discount_percentage: product.discount_percentage ?? 0,
    images: product.product_image.map((image) => ({ id: image.id, url: image.url, is_primary: image.is_primary })),
    category: product.category,
    brand: product.brand,
    age_range: product.age_range,
    recommended_age_min: product.recommended_age_min,
    recommended_age_max: product.recommended_age_max,
    material: product.material,
    safety_warnings: product.safety_warnings,
    choking_hazard: product.choking_hazard,
    min_order_quantity: product.min_order_quantity,
    max_order_quantity: product.max_order_quantity,
    in_stock: inStock(product),
    is_featured: product.is_featured,
  };
}

function toAdmin(product: ProductRow) {
  return {
    ...toPublic(product),
    sku: product.sku,
    is_active: product.is_active,
    stock_quantity: product.inventory?.stock_quantity ?? null,
    view_count: product.view_count,
    category_id: product.category_id,
    brand_id: product.brand_id,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
