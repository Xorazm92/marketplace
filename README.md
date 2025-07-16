# 🎯 INBOLA Kids Marketplace

> Safe, fun, and educational e-commerce platform for children and families

[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-blue)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-NestJS-red)](https://nestjs.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/your-username/inbola-kids-marketplace.git
cd inbola-kids-marketplace
```

### 2. Backend Setup
```bash
cd backend-main
npm install
cp .env.example .env
# Configure your database URL in .env
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

Backend will run on: http://0.0.0.0:4000

### 3. Frontend Setup
```bash
cd front-main
npm install
npm run dev
```

Frontend will run on: http://0.0.0.0:3000

### 4. Access Application
- **Frontend**: http://0.0.0.0:3000
- **Backend API**: http://0.0.0.0:4000/api
- **API Documentation**: http://0.0.0.0:4000/api-docs
- **Health Check**: http://0.0.0.0:4000/health

## 🏗️ Architecture

### Backend (NestJS + PostgreSQL)
- **Authentication**: JWT-based with RBAC
- **Database**: PostgreSQL with Prisma ORM
- **File Upload**: Local storage with image optimization
- **Real-time**: WebSocket for chat and notifications
- **Security**: Helmet, CORS, rate limiting
- **Monitoring**: Winston logging, Sentry error tracking

### Frontend (Next.js + React + TypeScript)
- **UI Framework**: React 19 with TypeScript
- **Styling**: SCSS modules (Etsy-inspired design)
- **State Management**: Redux Toolkit
- **API Client**: Axios with interceptors
- **Performance**: Image optimization, code splitting
- **SEO**: Meta tags, structured data

## 🎨 Features

### 👶 For Children
- **Safe Browsing**: Age-appropriate content filtering
- **Easy Navigation**: Large buttons and emoji icons
- **Educational Content**: Learning through shopping
- **Parental Controls**: Purchase approval system

### 👨‍👩‍👧‍👦 For Parents
- **Family Dashboard**: Manage children's accounts
- **Purchase Approval**: Review and approve purchases
- **Spending Limits**: Set budget controls
- **Activity Monitoring**: Track browsing and purchase history

### 🛍️ For Sellers
- **Product Management**: Easy listing with safety guidelines
- **Analytics Dashboard**: Sales insights and metrics
- **Communication Tools**: Safe messaging with families
- **Inventory Management**: Stock tracking and alerts

### 🔧 For Admins
- **Content Moderation**: Review products and content
- **User Management**: Handle disputes and support
- **Analytics**: Platform-wide insights
- **System Health**: Monitoring and maintenance tools

## 🧪 Testing

### Backend Tests
```bash
cd backend-main
npm run test              # Unit tests
npm run test:e2e          # Integration tests
npm run test:cov          # Coverage report
```

### Frontend Tests
```bash
cd front-main
npm run test              # Jest tests
npm run test:watch        # Watch mode
```

### Load Testing
```bash
cd backend-main
npm install -g k6
k6 run scripts/load-test.js
```

## 🚀 Production Deployment

### Using Replit Deployments
1. Click "Deploy" button in Replit
2. Select "Autoscale Deployment"
3. Configure machine power and max instances
4. Deploy

### Manual Production Setup
```bash
# Backend
cd backend-main
npm install --only=production
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start:prod

# Frontend
cd front-main
npm install --only=production
npm run build
npm run start
```

## 📊 Performance Optimizations

- **Image Optimization**: WebP/AVIF formats, responsive images
- **Code Splitting**: Dynamic imports, lazy loading
- **Caching**: Redis for sessions, CDN for static assets
- **Bundle Analysis**: Webpack bundle analyzer
- **Core Web Vitals**: Optimized for speed and UX

## 🔒 Security Features

- **Input Validation**: All inputs sanitized and validated
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encrypted sensitive data
- **Security Headers**: Helmet.js security middleware
- **Rate Limiting**: Prevent abuse and spam

## 🌍 Internationalization

- **Primary**: Uzbek (uz)
- **Secondary**: English (en) - Coming soon
- **Additional**: Russian (ru) - Planned

## 📱 Progressive Web App (PWA)

- **Offline Support**: Cached content for offline browsing
- **Push Notifications**: Order updates and promotions
- **App-like Experience**: Install on mobile devices
- **Performance**: Lighthouse score 95+

## 🔧 Development Commands

```bash
# Start development servers (parallel)
npm run dev:all

# Setup development environment
npm run setup:dev

# Run all tests
npm run test:all

# Build for production
npm run build:all

# Health check
npm run health:check

# Load testing
npm run load:test
```

## 📄 API Documentation

- **Swagger UI**: http://0.0.0.0:4000/api-docs
- **GraphQL Playground**: http://0.0.0.0:4000/graphql
- **Postman Collection**: `docs/postman-collection.json`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discord**: [Community Chat](https://discord.gg/inbola)
- **Email**: support@inbola.uz

---

Made with ❤️ for children and families