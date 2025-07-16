# 🎯 INBOLA Kids Marketplace

> Safe, fun, and educational e-commerce platform for children and families

[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-blue)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-NestJS-red)](https://nestjs.com/)
[![Database](https://img.shields.io/badge/Database-SQLite-green)](https://sqlite.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)

## 🚀 Quick Start

### 1. Setup Development Environment
Click the "Run" button or use the "Start Development Environment" workflow to automatically:
- Install all dependencies
- Setup database
- Generate Prisma client

### 2. Start Backend
Use the "Backend Development" workflow or run:
```bash
cd backend-main
npm run start:dev
```
Backend will run on: **http://0.0.0.0:4000**

### 3. Start Frontend
Use the "Frontend Development" workflow or run:
```bash
cd front-main
npm run dev
```
Frontend will run on: **http://0.0.0.0:3000**

### 4. Start Both (Parallel)
Use the "Full Development Stack" workflow to start both frontend and backend simultaneously.

## 🔗 Application URLs
- **Frontend**: http://0.0.0.0:3000
- **Backend API**: http://0.0.0.0:4000/api
- **API Documentation**: http://0.0.0.0:4000/api-docs
- **Health Check**: http://0.0.0.0:4000/health

## 🏗️ Architecture

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **API Documentation**: Swagger/OpenAPI
- **File Upload**: Multer with image optimization

### Frontend (Next.js)
- **Framework**: Next.js 15 with TypeScript
- **Styling**: SCSS modules
- **State Management**: Redux Toolkit
- **API Client**: Axios with interceptors
- **Image Optimization**: Next.js Image component

## 🎨 Features

### For Children (Age 3-12)
- **Safe Shopping**: Child-friendly interface with parental controls
- **Fun Categories**: Toys, Books, Educational materials, Clothing
- **Interactive Elements**: Colorful design and engaging animations
- **Learning Focus**: Educational products prioritized

### For Parents
- **Safety First**: All products reviewed for child safety
- **Order Management**: Track orders and manage preferences
- **Secure Payments**: Multiple payment options with security
- **Communication**: Direct messaging with sellers

### For Sellers
- **Product Management**: Easy listing and inventory management
- **Order Processing**: Streamlined order fulfillment
- **Analytics**: Sales insights and performance metrics
- **Customer Communication**: Direct messaging system

## 🔧 Available Workflows

1. **Start Development Environment** (Run button) - Setup everything
2. **Backend Development** - Start backend only
3. **Frontend Development** - Start frontend only  
4. **Full Development Stack** - Start both (parallel)
5. **Setup Database** - Database operations
6. **Run Tests** - Run all tests
7. **Health Check** - Check application health

## 🧪 Testing

```bash
# Backend tests
cd backend-main
npm run test              # Unit tests
npm run test:e2e          # Integration tests
npm run test:cov          # Coverage report

# Frontend tests
cd front-main
npm run test              # Jest tests
```

## 🚀 Production Deployment

Use Replit Deployments:
1. Click "Deploy" button in Replit
2. Select "Autoscale Deployment"
3. Configure machine power and instances
4. Deploy

## 🔒 Security Features

- Input validation and sanitization
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Rate limiting and security headers
- Child safety content filtering
- Secure file upload handling

## 📱 Progressive Web App (PWA)

- Offline support for browsing
- Push notifications for order updates
- App-like experience on mobile devices
- Fast loading with caching strategies

## 🌍 Internationalization

- **Primary**: Uzbek (uz)
- **Secondary**: English (en) - Coming soon
- **Planned**: Russian (ru)

## 🤝 Contributing

1. Use the development workflows for local testing
2. Follow TypeScript best practices
3. Add tests for new features
4. Update documentation as needed

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ for children and families in Uzbekistan**