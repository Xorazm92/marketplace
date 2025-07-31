# 📚 INBOLA Kids Marketplace - API Documentation

## 🔗 Base URLs

- **Development**: `http://localhost:3001`
- **Production**: `https://api.inbola.uz`

## 🔐 Authentication

### JWT Token Authentication
```http
Authorization: Bearer <access_token>
```

### Token Endpoints
- **Login**: `POST /api/v1/auth/login`
- **Register**: `POST /api/v1/auth/register`
- **Refresh**: `POST /api/v1/auth/refresh`
- **Logout**: `POST /api/v1/auth/logout`

## 📋 API Endpoints

### 🏠 Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-17T09:45:26.331Z",
  "uptime": 250.78,
  "environment": "development",
  "version": "1.0.0",
  "database": "Connected",
  "memory": {
    "used": "81 MB",
    "total": "87 MB"
  },
  "services": {
    "api": "Running",
    "auth": "Active",
    "childSafety": "Active",
    "chat": "Active"
  }
}
```

### 📦 Products

#### Get All Products
```http
GET /api/v1/product
```

#### Get Product by ID
```http
GET /api/v1/product/:id
```

#### Create Product (Auth Required)
```http
POST /api/v1/product
Content-Type: application/json

{
  "title": "Bolalar uchun kitob",
  "description": "Ta'limiy kitob",
  "price": "50000",
  "category_id": 1,
  "brand_id": 1,
  "condition": true,
  "negotiable": false
}
```

#### Update Product (Auth Required)
```http
PUT /api/v1/product/:id
```

#### Delete Product (Auth Required)
```http
DELETE /api/v1/product/:id
```

### 🏷️ Categories

#### Get All Categories
```http
GET /api/v1/category
```

#### Get Category by ID
```http
GET /api/v1/category/:id
```

#### Create Category (Admin Required)
```http
POST /api/v1/category
Content-Type: application/json

{
  "name": "Kitoblar",
  "slug": "books",
  "description": "Bolalar uchun kitoblar",
  "is_active": true
}
```

### 👤 Users

#### Get User Profile (Auth Required)
```http
GET /api/v1/user/profile
```

#### Update User Profile (Auth Required)
```http
PUT /api/v1/user/profile
```

#### Get User by ID
```http
GET /api/v1/user/:id
```

### 🛒 Cart

#### Get User Cart (Auth Required)
```http
GET /api/v1/cart
```

#### Add to Cart (Auth Required)
```http
POST /api/v1/cart/add
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}
```

#### Update Cart Item (Auth Required)
```http
PUT /api/v1/cart/item/:id
```

#### Remove from Cart (Auth Required)
```http
DELETE /api/v1/cart/item/:id
```

### 📋 Orders

#### Get User Orders (Auth Required)
```http
GET /api/v1/order
```

#### Create Order (Auth Required)
```http
POST /api/v1/order
Content-Type: application/json

{
  "shipping_address": "Toshkent, Chilonzor tumani",
  "notes": "Tezroq yetkazib bering"
}
```

#### Get Order by ID (Auth Required)
```http
GET /api/v1/order/:id
```

### ⭐ Reviews

#### Get Product Reviews
```http
GET /api/v1/review/product/:productId
```

#### Create Review (Auth Required)
```http
POST /api/v1/review
Content-Type: application/json

{
  "product_id": 1,
  "rating": 5,
  "comment": "Juda yaxshi mahsulot!"
}
```

### 🏢 Brands

#### Get All Brands
```http
GET /api/v1/brand
```

#### Get Brand by ID
```http
GET /api/v1/brand/:id
```

### 💰 Currency

#### Get All Currencies
```http
GET /api/v1/currency
```

### 🔧 Admin Endpoints

#### Admin Dashboard (Admin Required)
```http
GET /api/v1/admin/dashboard
```

#### Get All Users (Admin Required)
```http
GET /api/v1/admin/users
```

#### Get All Orders (Admin Required)
```http
GET /api/v1/admin/orders
```

#### Approve Product (Admin Required)
```http
PUT /api/v1/admin/product/:id/approve
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "timestamp": "2025-07-17T09:45:26.331Z"
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request",
  "timestamp": "2025-07-17T09:45:26.331Z",
  "path": "/api/v1/product"
}
```

## 🔍 Query Parameters

### Pagination
```http
GET /api/v1/product?page=1&limit=10
```

### Filtering
```http
GET /api/v1/product?category=1&minPrice=10000&maxPrice=100000
```

### Sorting
```http
GET /api/v1/product?sortBy=price&sortOrder=asc
```

### Search
```http
GET /api/v1/product?search=kitob
```

## 📝 Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## 🔒 Security

- **Rate Limiting**: 100 requests per minute
- **CORS**: Configured for frontend domain
- **Input Validation**: All inputs validated
- **SQL Injection**: Protected by Prisma ORM
- **XSS Protection**: Content Security Policy

## 📱 GraphQL API

GraphQL endpoint: `/graphql`

### Example Query
```graphql
query GetProducts {
  products {
    id
    title
    price
    description
    category {
      name
    }
    product_image {
      url
    }
  }
}
```

## 🧪 Testing

### Health Check Test
```bash
curl -X GET http://localhost:3001/health
```

### API Test
```bash
curl -X GET http://localhost:3001/api/v1/category
```

---

**📚 Complete API documentation available at: http://localhost:3001/api-docs**
