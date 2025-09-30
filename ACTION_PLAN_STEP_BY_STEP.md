# 🚀 AMALIY QADAMLAR - Qadam-baqadam Yo'riqnoma

## 📋 DARHOL BAJARILISHI KERAK (Bugun)

### ✅ QADАМ 1: Backend Serverni Restart Qilish (5 daqiqa)

**Terminal 1'da:**
```bash
cd /home/ctrl/Pictures/marketplace/backend-main

# Agar server ishlab turgan bo'lsa, Ctrl+C bosing
# Keyin qayta ishga tushiring:
npm run start:dev

# Kutish: "🚀 INBOLA Backend server ishga tushdi: http://0.0.0.0:4000"
```

**Tekshirish:**
```bash
# Yangi terminal oching va tekshiring:
curl http://localhost:4000/health
# Natija: {"status":"ok"}

curl http://localhost:4000/api/v1/category | jq length
# Natija: 21

curl http://localhost:4000/api/v1/category/1
# Natija: { "id": 1, "name": "Kiyim-kechak", ... }
```

✅ **Muvaffaqiyatli!** CategoryService endi database'dan yuklanadi.

---

### ✅ QADAM 2: O'zbekiston Ma'lumotlarini Seed Qilish (30 daqiqa)

**2.1 Viloyatlar seed qilish:**

```bash
cd /home/ctrl/Pictures/marketplace/backend-main
```

**Fayl yarating:** `prisma/seed-regions.sql`
```sql
-- O'zbekiston viloyatlari
INSERT INTO region (name, code, created_at, updated_at) VALUES
('Toshkent shahri', 'TAS', NOW(), NOW()),
('Toshkent viloyati', 'TOS', NOW(), NOW()),
('Andijon', 'AND', NOW(), NOW()),
('Farg''ona', 'FAR', NOW(), NOW()),
('Namangan', 'NAM', NOW(), NOW()),
('Samarqand', 'SAM', NOW(), NOW()),
('Buxoro', 'BUX', NOW(), NOW()),
('Navoiy', 'NAV', NOW(), NOW()),
('Xorazm', 'XOR', NOW(), NOW()),
('Qashqadaryo', 'QAS', NOW(), NOW()),
('Surxondaryo', 'SUR', NOW(), NOW()),
('Sirdaryo', 'SIR', NOW(), NOW()),
('Jizzax', 'JIZ', NOW(), NOW()),
('Qoraqalpog''iston', 'QOR', NOW(), NOW());

-- Verify
SELECT id, name, code FROM region;
```

**Ishga tushirish:**
```bash
PGPASSWORD=inbola_password psql -U inbola_user -d inbola_db -f prisma/seed-regions.sql
```

**2.2 Demo mahsulotlar yaratish:**

**Fayl yarating:** `prisma/seed-demo-products.sql`
```sql
-- Demo mahsulotlar (har kategoriyadan 3 tadan)
INSERT INTO product (
  title, description, price, currency_id, brand_id, 
  category_id, user_id, phone_number, condition, 
  negotiable, is_active, is_deleted, view_count,
  age_range, safety_info, educational_value,
  "createdAt", "updatedAt"
) VALUES
-- Kiyim-kechak kategoriyasi (ID: 1)
('Bolalar kurtka', 'Qishki issiq kurtka, 5-7 yosh', 250000, 1, 1, 1, 1, '+998991234567', 'new', true, true, false, 0, '5-7', 'Xavfsiz materiallar', 'Issiqlikni saqlaydi', NOW(), NOW()),
('Bolalar shim', 'Sport shim, 8-10 yosh', 120000, 1, 1, 1, 1, '+998991234567', 'new', true, true, false, 0, '8-10', 'Yumshoq mato', NULL, NOW(), NOW()),
('Bolalar ko''ylagi', 'Yozgi ko''ylak, 3-5 yosh', 80000, 1, 2, 1, 1, '+998991234567', 'new', false, true, false, 0, '3-5', 'Tabiiy mato', NULL, NOW(), NOW()),

-- O'yinchoqlar kategoriyasi (ID: 2)
('Lego konstruktor', '500 qismli konstruktor to''plami', 450000, 1, 1, 2, 1, '+998991234567', 'new', true, true, false, 0, '6-12', 'Plastik, zaharlanmagan', 'Ijodiy fikrlashni rivojlantiradi', NOW(), NOW()),
('Yumshoq ayiq', 'Katta yumshoq o''yinchoq ayiq', 180000, 1, 2, 2, 1, '+998991234567', 'new', true, true, false, 0, '3+', 'Yumshoq, allergiyaga qarshi', 'Emotsional rivojlanish', NOW(), NOW()),
('Mashina to''plami', '5 ta metall mashina', 90000, 1, 1, 2, 1, '+998991234567', 'new', false, true, false, 0, '4-8', 'Metall, bo''yalgan', 'Motor skill', NOW(), NOW()),

-- Kitoblar kategoriyasi (ID: 3)
('Ertaklar to''plami', 'O''zbek xalq ertaklari', 65000, 1, 1, 3, 1, '+998991234567', 'new', true, true, false, 0, '3-7', 'Qattiq muqova', 'O''qishni o''rgatadi', NOW(), NOW()),
('Matematik darslik', '1-sinf matematika', 35000, 1, 2, 3, 1, '+998991234567', 'new', false, true, false, 0, '6-8', 'Ta''limiy', 'Matematika asoslari', NOW(), NOW()),
('Ranglashtirish kitobi', 'Hayvonlar dunyosi', 25000, 1, 1, 3, 1, '+998991234567', 'new', true, true, false, 0, '4-10', 'Qog''oz, rang-barang', 'Kreativlik', NOW(), NOW()),

-- Sport kategoriyasi (ID: 4)
('Futbol to''pi', 'Professional futbol to''pi', 150000, 1, 1, 4, 1, '+998991234567', 'new', true, true, false, 0, '8+', 'Zarar yetkazmaydi', 'Jismoniy rivojlanish', NOW(), NOW()),
('Bolalar velosipedi', '12 dyuymli g''ildirakli', 850000, 1, 2, 4, 1, '+998991234567', 'new', true, true, false, 0, '5-8', 'Helmet bilan', 'Koordinatsiya', NOW(), NOW()),
('Basketbol to''pi', 'Bolalar uchun basketbol', 95000, 1, 1, 4, 1, '+998991234567', 'new', false, true, false, 0, '7+', 'Yumshoq rezina', 'Sport', NOW(), NOW()),

-- Maktab kategoriyasi (ID: 5)
('Ruchkalar to''plami', '10 ta rang-barang ruchka', 35000, 1, 1, 5, 1, '+998991234567', 'new', true, true, false, 0, '6+', 'Zaharlanmagan siyoh', 'Yozishni o''rgatadi', NOW(), NOW()),
('Daftarlar to''plami', '5 ta 48 varoqli daftar', 20000, 1, 2, 5, 1, '+998991234567', 'new', false, true, false, 0, '6+', 'Sifatli qog''oz', 'Ta''lim', NOW(), NOW()),
('Rangli qalamlar', '24 rangda qalamlar', 45000, 1, 1, 5, 1, '+998991234567', 'new', true, true, false, 0, '5+', 'Yog''ochdan', 'San''at', NOW(), NOW()),

-- Chaqaloq kategoriyasi (ID: 6)
('Chaqaloq shampuni', 'Tabiiy shampun, 500ml', 55000, 1, 1, 6, 1, '+998991234567', 'new', false, true, false, 0, '0-2', 'Ko''zga kirmaydi', 'Tozalik', NOW(), NOW()),
('Chaqaloq kiyimi', 'Yumshoq paxta kiyim to''plami', 180000, 1, 2, 6, 1, '+998991234567', 'new', true, true, false, 0, '0-1', 'Paxta 100%', 'Qulay', NOW(), NOW()),
('Chaqaloq o''yinchoqi', 'Tovushli o''yinchoq', 75000, 1, 1, 6, 1, '+998991234567', 'new', true, true, false, 0, '0-1', 'Plastik, xavfsiz', 'Diqqatni jalb qiladi', NOW(), NOW());

-- Verify
SELECT id, title, category_id, price FROM product ORDER BY category_id, id;
```

**Ishga tushirish:**
```bash
PGPASSWORD=inbola_password psql -U inbola_user -d inbola_db -f prisma/seed-demo-products.sql
```

**Tekshirish:**
```bash
curl http://localhost:4000/api/v1/product/all | jq '.data | length'
# Natija: 18 (har kategoriyadan 3 ta)
```

---

### ✅ QADAM 3: Frontend Tekshirish (10 daqiqa)

**Terminal 2'da:**
```bash
cd /home/ctrl/Pictures/marketplace/front-main

# Agar ishlamasa:
npm run dev

# Kutish: "ready - started server on 0.0.0.0:3000"
```

**Browser'da tekshirish:**
1. http://localhost:3000 - Bosh sahifa ✅
2. http://localhost:3000/products - Mahsulotlar ro'yxati ✅
3. http://localhost:3000/admin?tab=products - Admin panel ✅

---

## 📅 HAFTA 1: Asosiy Funktsiyalar (Dushanba-Juma)

### 🔍 QADAM 4: Search Functionality (Dushanba, 4-5 soat)

**4.1 Backend: ProductService'ga qidiruv qo'shish**

**Fayl:** `/home/ctrl/Pictures/marketplace/backend-main/src/product/product.service.ts`

```typescript
// Qo'shish kerak:
async searchProducts(searchDto: SearchProductDto) {
  const { query, category_id, min_price, max_price, brand_id } = searchDto;
  
  const where: any = {
    is_active: true,
    is_deleted: false,
  };
  
  // Text search
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }
  
  // Filters
  if (category_id) where.category_id = Number(category_id);
  if (brand_id) where.brand_id = Number(brand_id);
  if (min_price) where.price = { ...where.price, gte: Number(min_price) };
  if (max_price) where.price = { ...where.price, lte: Number(max_price) };
  
  const products = await this.prisma.product.findMany({
    where,
    include: {
      category: true,
      brand: true,
      currency: true,
      product_image: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return products;
}
```

**4.2 Controller'ga endpoint qo'shish**

```typescript
// product.controller.ts
@Get('search')
@ApiOperation({ summary: 'Search products' })
async search(@Query() searchDto: SearchProductDto) {
  return this.productService.searchProducts(searchDto);
}
```

**4.3 DTO yaratish**

**Fayl:** `src/product/dto/search-product.dto.ts`
```typescript
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchProductDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  category_id?: number;

  @ApiPropertyOptional({ description: 'Brand ID' })
  @IsOptional()
  @IsNumber()
  brand_id?: number;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @IsNumber()
  min_price?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @IsNumber()
  max_price?: number;
}
```

**Tekshirish:**
```bash
curl "http://localhost:4000/api/v1/product/search?query=konstruktor"
curl "http://localhost:4000/api/v1/product/search?category_id=2&min_price=100000"
```

---

### 📁 QADAM 5: File Upload Tuzatish (Seshanba, 3-4 soat)

**5.1 Upload va Uploads modullarni tekshirish**

```bash
# Qaysi module ishlatilayotganini aniqlash
cd /home/ctrl/Pictures/marketplace/backend-main
grep -r "upload" src/product/product.controller.ts
```

**5.2 Birini tanlash va ikkinchisini o'chirish**

**Tavsiya:** `upload.module.ts` ni saqlash, `uploads.module.ts` ni o'chirish

```bash
# Backup
mv src/uploads src/uploads.backup

# app.module.ts dan o'chirish
# UploadModule qoldirish
```

**5.3 Image optimization qo'shish**

**Fayl:** `src/upload/upload.service.ts`
```typescript
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  async processImage(file: Express.Multer.File) {
    const filename = `${Date.now()}-${file.originalname}`;
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // Create directories
    ['original', 'large', 'medium', 'thumb'].forEach(dir => {
      const dirPath = path.join(uploadsDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    
    // Process image
    const buffer = file.buffer;
    
    // Original
    await sharp(buffer)
      .jpeg({ quality: 90 })
      .toFile(path.join(uploadsDir, 'original', filename));
    
    // Large (1920px)
    await sharp(buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(path.join(uploadsDir, 'large', filename));
    
    // Medium (800px)
    await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(path.join(uploadsDir, 'medium', filename));
    
    // Thumbnail (200px)
    await sharp(buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 75 })
      .toFile(path.join(uploadsDir, 'thumb', filename));
    
    return {
      filename,
      original: `/uploads/original/${filename}`,
      large: `/uploads/large/${filename}`,
      medium: `/uploads/medium/${filename}`,
      thumb: `/uploads/thumb/${filename}`,
    };
  }
}
```

---

### 🔐 QADAM 6: Security Hardening (Chorshanba, 2-3 soat)

**6.1 CORS to'g'rilash**

**Fayl:** `src/main.ts`
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:4000',
    process.env.FRONTEND_URL || 'https://inbola.uz',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],
});
```

**6.2 Rate Limiting aktiv qilish**

**Fayl:** `src/app.module.ts`
```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },
],
```

**6.3 Helmet qo'shish**

**Fayl:** `src/main.ts`
```typescript
import helmet from 'helmet';

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
    },
  },
}));
```

---

## 📅 HAFTA 2: Real-time Features (Dushanba-Juma)

### 🔌 QADAM 7: WebSocket Integration (Dushanba-Seshanba, 6-8 soat)

**7.1 Socket.io o'rnatish**

```bash
cd /home/ctrl/Pictures/marketplace/backend-main
npm install --save @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**7.2 WebSocket Gateway yaratish**

**Fayl:** `src/realtime/realtime.gateway.ts`
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, number>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: number) {
    this.connectedUsers.set(client.id, userId);
    client.join(`user-${userId}`);
    return { event: 'joined', data: { userId } };
  }

  // Notification emit
  emitNotification(userId: number, notification: any) {
    this.server.to(`user-${userId}`).emit('notification', notification);
  }

  // Chat message
  emitChatMessage(roomId: string, message: any) {
    this.server.to(`room-${roomId}`).emit('message', message);
  }

  // Order update
  emitOrderUpdate(userId: number, order: any) {
    this.server.to(`user-${userId}`).emit('order-update', order);
  }
}
```

**7.3 Module'da ro'yxatdan o'tkazish**

**Fayl:** `src/realtime/realtime.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
```

**7.4 Frontend integration**

**Fayl:** `front-main/lib/socket.ts`
```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const initSocket = (userId: number) => {
  socket = io('http://localhost:4000', {
    transports: ['websocket'],
    auth: {
      userId,
    },
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket');
    socket.emit('join', userId);
  });

  socket.on('notification', (data) => {
    console.log('New notification:', data);
    // Show toast notification
  });

  socket.on('message', (data) => {
    console.log('New message:', data);
    // Update chat
  });

  socket.on('order-update', (data) => {
    console.log('Order updated:', data);
    // Update order status
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};
```

**Tekshirish:**
```bash
# Backend logs'da ko'rinishi kerak:
# Client connected: abc123...
```

---

## 📅 HAFTA 3: Payment & Testing (Dushanba-Juma)

### 💳 QADAM 8: Click Payment Real Mode (Chorshanba-Payshanba, 8-10 soat)

**8.1 Click credentials olish**

1. https://my.click.uz ga ro'yxatdan o'tish
2. Merchant yaratish
3. Service ID va Secret Key olish

**8.2 .env ga qo'shish**

```bash
# .env
CLICK_MERCHANT_ID=your_merchant_id
CLICK_SERVICE_ID=your_service_id
CLICK_SECRET_KEY=your_secret_key
CLICK_MERCHANT_USER_ID=your_user_id
```

**8.3 Payment Service update**

**Fayl:** `src/payment/click-payment.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class ClickPaymentService {
  constructor(private configService: ConfigService) {}

  async preparePayment(orderId: number, amount: number) {
    const merchantId = this.configService.get('CLICK_MERCHANT_ID');
    const serviceId = this.configService.get('CLICK_SERVICE_ID');
    
    const paymentUrl = `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${orderId}&return_url=http://localhost:3000/payment/success`;
    
    return {
      payment_url: paymentUrl,
      order_id: orderId,
      amount,
    };
  }

  async handleWebhook(data: any) {
    const secretKey = this.configService.get('CLICK_SECRET_KEY');
    
    // Verify signature
    const signString = `${data.click_trans_id}${data.service_id}${secretKey}${data.merchant_trans_id}${data.amount}${data.action}${data.sign_time}`;
    const signHash = crypto.createHash('md5').update(signString).digest('hex');
    
    if (signHash !== data.sign_string) {
      throw new Error('Invalid signature');
    }
    
    // Process payment
    if (data.action === 0) {
      // Prepare
      return {
        click_trans_id: data.click_trans_id,
        merchant_trans_id: data.merchant_trans_id,
        merchant_prepare_id: Date.now(),
        error: 0,
        error_note: 'Success',
      };
    } else if (data.action === 1) {
      // Complete
      await this.completePayment(data.merchant_trans_id, data.click_trans_id);
      return {
        click_trans_id: data.click_trans_id,
        merchant_trans_id: data.merchant_trans_id,
        merchant_confirm_id: Date.now(),
        error: 0,
        error_note: 'Success',
      };
    }
  }

  private async completePayment(orderId: string, transactionId: string) {
    // Update order status
    // Send notification to user
  }
}
```

---

## 📈 MONITORING VA STATISTICS

### Har kuni tekshirish:

```bash
# Backend health
curl http://localhost:4000/health

# Categories count
curl http://localhost:4000/api/v1/category | jq length

# Products count
curl http://localhost:4000/api/v1/product/all | jq '.data | length'

# Database stats
PGPASSWORD=inbola_password psql -U inbola_user -d inbola_db -c "
SELECT 
  'products' as table_name, COUNT(*) as count FROM product
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'users', COUNT(*) FROM \"user\"
UNION ALL
SELECT 'orders', COUNT(*) FROM \"order\"
UNION ALL
SELECT 'brands', COUNT(*) FROM brand;
"
```

---

## ✅ CHECKLIST - Har qadam uchun

### Bajarilganini belgilang:

**Darhol (Bugun):**
- [ ] Backend restart qilindi
- [ ] Categories 21 ta qaytaradi
- [ ] Viloyatlar seeded
- [ ] Demo mahsulotlar yaratildi (18 ta)
- [ ] Frontend ochiladi

**Hafta 1:**
- [ ] Search functionality ishlaydi
- [ ] File upload birlashtirildi
- [ ] Image optimization ishlaydi
- [ ] CORS to'g'rilandi
- [ ] Rate limiting aktiv
- [ ] Helmet configured

**Hafta 2:**
- [ ] WebSocket Gateway yaratildi
- [ ] Frontend Socket.io ulandi
- [ ] Real-time notifications ishlaydi
- [ ] Chat real-time bo'ldi

**Hafta 3:**
- [ ] Click Payment real mode
- [ ] Payme Payment real mode
- [ ] Webhook handling ishlaydi
- [ ] Order status real-time yangilanadi

---

**Tayyorlagan:** Cascade AI  
**Sana:** 2025-09-30  
**Prioritet:** DARHOL BOSHLASH!
