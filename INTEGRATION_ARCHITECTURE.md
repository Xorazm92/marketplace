# 🏗️ INBOLA Marketplace - Integratsiya Arxitekturasi

## 📊 UMUMIY ARXITEKTURA

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                    │
│                      http://localhost:3000                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │Endpoints │  │  Store   │   │
│  │  (30+)   │  │  (179)   │  │   (19)   │  │ (Redux)  │   │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘   │
│        │             │              │              │         │
│        └─────────────┴──────────────┴──────────────┘        │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │ HTTP/REST API
                           │ (GraphQL ❌ Disabled)
┌──────────────────────────┼───────────────────────────────────┐
│                          ▼                                   │
│                    API Gateway                               │
│              (CORS, Rate Limit, Auth)                        │
│                          │                                   │
├──────────────────────────┼───────────────────────────────────┤
│                 BACKEND (NestJS)                             │
│              http://localhost:4000                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Controllers (50+)                        │  │
│  │   ┌──────┬──────┬──────┬──────┬──────┬──────┐       │  │
│  │   │Product│Cart │Order │Auth │User │Category│       │  │
│  │   └───┬──┴───┬─┴───┬──┴───┬──┴──┬──┴───┬────┘       │  │
│  └───────┼──────┼─────┼──────┼─────┼──────┼────────────┘  │
│          │      │     │      │     │      │                │
│  ┌───────┼──────┼─────┼──────┼─────┼──────┼────────────┐  │
│  │       ▼      ▼     ▼      ▼     ▼      ▼            │  │
│  │              Services (60+)                          │  │
│  │   - Business Logic                                   │  │
│  │   - Data Validation                                  │  │
│  │   - External API Calls                               │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────┴───────────────────────────────────┐  │
│  │              Prisma ORM                              │  │
│  │   - Query Builder                                    │  │
│  │   - Schema Management                                │  │
│  │   - Migrations                                       │  │
│  └──────────────────┬───────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────────┘
                     │
┌────────────────────┼────────────────────────────────────────┐
│                    ▼                                        │
│              PostgreSQL Database                            │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  users   │  │ products │  │categories│  │  orders  │  │
│  │  (1)     │  │   (0)    │  │  (21)    │  │   (0)    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  brands  │  │   cart   │  │ wishlist │  │ payments │  │
│  │  (2)     │  │   (0)    │  │   (0)    │  │   (0)    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 MA'LUMOT OQIMI (Data Flow)

### 1. MAHSULOT YARATISH (Product Creation)

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: /pages/admin.tsx?tab=products                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 1. User fills form
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ ProductForm Component                                        │
│ - Title, Price, Description                                  │
│ - Category (ID 1-21)                                         │
│ - Brand (ID 1-2)                                             │
│ - Age Range, Safety Info                                     │
│ - Images (Drag & Drop)                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 2. FormData with images
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ /endpoints/product.ts                                        │
│ createProduct(formData)                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 3. POST /api/v1/product/create
                       │    multipart/form-data
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: ProductController                                   │
│ @Post('create')                                              │
│ @UseInterceptors(FilesInterceptor('images'))                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 4. Validate DTO
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ CreateProductDto                                             │
│ ✅ title: string                                             │
│ ✅ price: number                                             │
│ ✅ category_id: number (1-21)                                │
│ ✅ brand_id: number (1-2)                                    │
│ ✅ age_range: string                                         │
│ ✅ safety_info: string                                       │
│ ✅ images: File[]                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 5. Process files
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Multer Middleware                                            │
│ - Save to ./uploads/                                         │
│ - Generate unique filenames                                  │
│ ⚠️ No Sharp optimization yet                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 6. Call service
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ ProductService.create()                                      │
│ - Validate category exists                                   │
│ - Validate brand exists                                      │
│ - Generate slug (optional)                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 7. Database insert
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Prisma.product.create()                                      │
│ INSERT INTO product (                                        │
│   title, price, category_id, brand_id,                      │
│   age_range, safety_info, ...                               │
│ ) VALUES (...)                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 8. Save images
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Prisma.productImage.createMany()                            │
│ INSERT INTO product_image (                                  │
│   product_id, url, is_primary                               │
│ ) VALUES (...)                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 9. Return response
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Response: Product Object                                     │
│ {                                                            │
│   id: 1,                                                     │
│   title: "Konstruktor",                                      │
│   price: 150000,                                             │
│   category: { id: 10, name: "Konstruktor" },                │
│   brand: { id: 1, name: "inbola" },                         │
│   product_image: [                                           │
│     { url: "/uploads/abc123.jpg" }                           │
│   ]                                                          │
│ }                                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 10. Update UI
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Success                                            │
│ - Show toast notification                                    │
│ - Redirect to product list                                   │
│ - Update Redux store                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 AUTENTIFIKATSIYA OQIMI

### JWT Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. USER LOGIN                                                │
├──────────────────────────────────────────────────────────────┤
│ POST /api/v1/phone-auth/login                                │
│ Body: { phone_number: "+998991234567", password: "***" }    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. BACKEND VALIDATION                                        │
├──────────────────────────────────────────────────────────────┤
│ PhoneAuthController → PhoneAuthService                       │
│ - Find user by phone                                         │
│ - Verify password (bcrypt)                                   │
│ - Check user is_active                                       │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. GENERATE TOKENS                                           │
├──────────────────────────────────────────────────────────────┤
│ JwtService.sign()                                            │
│ - Access Token (15 min)                                      │
│ - Refresh Token (7 days)                                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. RESPONSE                                                  │
├──────────────────────────────────────────────────────────────┤
│ {                                                            │
│   accessToken: "eyJhbGc...",                                 │
│   refreshToken: "eyJhbGc...",                                │
│   user: {                                                    │
│     id: 1,                                                   │
│     first_name: "Test",                                      │
│     phone_number: "+998991234567"                            │
│   }                                                          │
│ }                                                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. FRONTEND STORAGE                                          │
├──────────────────────────────────────────────────────────────┤
│ localStorage.setItem('accessToken', token)                   │
│ localStorage.setItem('refreshToken', token)                  │
│ Redux store.dispatch(setUser(user))                          │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. SUBSEQUENT REQUESTS                                       │
├──────────────────────────────────────────────────────────────┤
│ Headers: {                                                   │
│   Authorization: "Bearer eyJhbGc..."                         │
│ }                                                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. BACKEND JWT GUARD                                         │
├──────────────────────────────────────────────────────────────┤
│ @UseGuards(JwtAuthGuard)                                     │
│ - Extract token from header                                  │
│ - Verify token signature                                     │
│ - Check expiration                                           │
│ - Attach user to request                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛒 SAVATCHA VA BUYURTMA OQIMI

```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTIONS                                                 │
└────┬───────────┬───────────┬───────────┬────────────────────┘
     │           │           │           │
     │ Add to    │ Update    │ Remove    │ Checkout
     │ Cart      │ Quantity  │ Item      │
     │           │           │           │
     ▼           ▼           ▼           ▼
┌────────────────────────────────────────────────────────────┐
│ CartContext (Frontend State)                               │
│ - cartItems: []                                            │
│ - totalPrice: 0                                            │
│ - itemCount: 0                                             │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ POST /api/v1/cart/add
                 │ PATCH /api/v1/cart/update/:id
                 │ DELETE /api/v1/cart/remove/:id
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: CartController                                     │
│ - addToCart(productId, quantity)                            │
│ - updateQuantity(cartItemId, quantity)                      │
│ - removeItem(cartItemId)                                    │
│ - getCart(userId)                                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ CartService                                                 │
│ - Validate product exists                                   │
│ - Check stock availability                                  │
│ - Calculate total price                                     │
│ - Apply discounts (if any)                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Database Operations
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ cart Table                                                  │
│ ┌──────┬─────────┬────────────┬──────────┬────────────┐   │
│ │ id   │ user_id │ product_id │ quantity │ created_at │   │
│ ├──────┼─────────┼────────────┼──────────┼────────────┤   │
│ │ 1    │ 1       │ 5          │ 2        │ 2025-...   │   │
│ │ 2    │ 1       │ 12         │ 1        │ 2025-...   │   │
│ └──────┴─────────┴────────────┴──────────┴────────────┘   │
└─────────────────────────────────────────────────────────────┘
                 │
                 │ CHECKOUT
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ POST /api/v1/order/create                                   │
│ Body: {                                                     │
│   cartItems: [...],                                         │
│   address_id: 1,                                            │
│   payment_method: "click"                                   │
│ }                                                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ OrderService.createOrder()                                  │
│ 1. Validate all products available                          │
│ 2. Calculate total amount                                   │
│ 3. Create order record                                      │
│ 4. Create order_items                                       │
│ 5. Initiate payment                                         │
│ 6. Clear cart                                               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ PaymentService                                              │
│ - Click Payment Gateway ⚠️ Test Mode                        │
│ - Payme Payment Gateway ⚠️ Test Mode                        │
│ - Generate payment URL                                      │
│ - Handle webhook callbacks                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ REDIRECT
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Payment Gateway (Click/Payme)                               │
│ - User completes payment                                    │
│ - Webhook sent to backend                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ POST /api/v1/payment/webhook
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ PaymentController.handleWebhook()                           │
│ - Verify signature                                          │
│ - Update order status                                       │
│ - Send notification to user                                 │
│ - Send notification to seller                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 MUAMMOLI INTEGRATSIYALAR

### ❌ 1. GraphQL Integration (O'chirilgan)

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND                                                 │
│ - Apollo Client configured ✅                            │
│ - GraphQL queries written ✅                             │
│ - Subscriptions setup ✅                                 │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ GraphQL queries
                        ▼
┌─────────────────────────────────────────────────────────┐
│ BACKEND                                                  │
│ - GraphQLModule.forRoot() ❌ COMMENTED OUT              │
│ - Schema generation ❌ ERROR                            │
│ - Resolvers ❌ NOT ACTIVE                               │
└─────────────────────────────────────────────────────────┘

RESULT: Frontend GraphQL requests fail!
```

**Hal:** GraphQL to'liq o'chirish yoki tuzatish

---

### ❌ 2. Real-time WebSocket (Yo'q)

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND                                                 │
│ - Chat components ready ✅                               │
│ - Notification components ready ✅                       │
│ - Socket.io client ❌ NOT CONFIGURED                    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ ws://localhost:4000
                        ▼
┌─────────────────────────────────────────────────────────┐
│ BACKEND                                                  │
│ - realtime.module.ts exists ✅                           │
│ - WebSocketGateway ❌ NOT IMPLEMENTED                   │
│ - Socket.io ❌ NOT INSTALLED                            │
└─────────────────────────────────────────────────────────┘

RESULT: No real-time features!
```

**Hal:** WebSocket Gateway implement qilish

---

### ⚠️ 3. File Upload (Ikki xil module)

```
┌──────────────────┐      ┌──────────────────┐
│ upload.module    │  vs  │ uploads.module   │
│ - Multer ✅      │      │ - Sharp ✅       │
│ - /upload/* ✅   │      │ - /uploads/* ✅  │
└──────────────────┘      └──────────────────┘
         │                         │
         └─────────┬───────────────┘
                   │
                   ▼
         CONFUSION & CONFLICTS!
```

**Hal:** Birini tanlash, ikkinchisini o'chirish

---

### ⚠️ 4. Search (Qisman)

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND: /pages/search.tsx                              │
│ - Search input ✅                                        │
│ - Filters ✅                                             │
│ - Results display ✅                                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ GET /api/v1/product/all?search=...
                        ▼
┌─────────────────────────────────────────────────────────┐
│ BACKEND: ProductController                               │
│ - Basic search ✅ (title LIKE %query%)                   │
│ - Advanced filters ⚠️ (partial)                          │
│ - Search indexing ❌ (not implemented)                   │
│ - Elasticsearch ❌ (not integrated)                      │
└─────────────────────────────────────────────────────────┘

RESULT: Slow search on large datasets!
```

**Hal:** PostgreSQL full-text search yoki Elasticsearch

---

## 📈 PERFORMANCE BOTTLENECKS

### 1. N+1 Query Problem

```typescript
// ❌ BAD (N+1 queries)
const products = await prisma.product.findMany();
for (const product of products) {
  product.category = await prisma.category.findUnique({
    where: { id: product.category_id }
  });
  product.brand = await prisma.brand.findUnique({
    where: { id: product.brand_id }
  });
}

// ✅ GOOD (1 query)
const products = await prisma.product.findMany({
  include: {
    category: true,
    brand: true,
    product_image: true
  }
});
```

### 2. No Caching

```typescript
// ❌ Current: Every request hits database
const categories = await prisma.category.findMany();

// ✅ Should: Cache for 5 minutes
@UseInterceptors(CacheInterceptor)
@CacheTTL(300)
async findAll() {
  return this.prisma.category.findMany();
}
```

### 3. Large Image Files

```
❌ Original images served directly (5MB+)
✅ Should: Optimized thumbnails (50KB)
```

---

## 🎯 TAVSIYA QILINGAN ARXITEKTURA

### Ideal Structure (Kelajak)

```
┌──────────────────────────────────────────────────┐
│           CDN (Cloudflare/AWS)                   │
│           - Static assets                        │
│           - Optimized images                     │
└─────────────────────┬────────────────────────────┘
                      │
┌─────────────────────┼────────────────────────────┐
│              Load Balancer (Nginx)               │
└─────────────────────┬────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐        ┌─────────▼──────┐
│  Frontend      │        │  Backend       │
│  (Next.js)     │        │  (NestJS)      │
│  - SSR/ISR     │        │  - API         │
│  - Static Gen  │        │  - WebSocket   │
└────────────────┘        └────────┬───────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
            ┌───────▼──────┐ ┌────▼─────┐ ┌─────▼─────┐
            │ PostgreSQL   │ │  Redis   │ │Elasticsearch│
            │ (Primary DB) │ │ (Cache)  │ │  (Search)  │
            └──────────────┘ └──────────┘ └────────────┘
```

---

**Tayyorlagan:** Cascade AI  
**Sana:** 2025-09-30  
**Status:** Arxitektura tahlili to'liq!
