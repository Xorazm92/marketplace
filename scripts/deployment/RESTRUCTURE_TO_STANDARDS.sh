#!/bin/bash

# ===========================================
# 🏗️ INBOLA MARKETPLACE - INTERNATIONAL STANDARDS RESTRUCTURE
# ===========================================
# Loyihani xalqaro standartlarga moslash
# Author: INBOLA Development Team
# Version: 1.0.0

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🏗️ INBOLA MARKETPLACE - INTERNATIONAL STANDARDS RESTRUCTURE${NC}"
echo -e "${PURPLE}================================================================${NC}"

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Backup current structure
echo -e "${BLUE}📦 Step 1: Creating backup${NC}"
cp -r . ../marketplace-backup-$(date +%Y%m%d_%H%M%S)
print_status "Backup yaratildi"

# Create new standard structure
echo -e "${BLUE}🏗️ Step 2: Creating standard directory structure${NC}"

# Create main directories
mkdir -p apps/api
mkdir -p apps/web
mkdir -p packages/shared
mkdir -p packages/ui
mkdir -p docs
mkdir -p scripts/deployment
mkdir -p scripts/development
mkdir -p docker
mkdir -p .github/workflows
mkdir -p tools

print_status "Standard papkalar yaratildi"

# Move backend to apps/api
echo -e "${BLUE}🔧 Step 3: Moving backend to apps/api${NC}"
if [ -d "backend-main" ]; then
    cp -r backend-main/* apps/api/
    print_status "Backend apps/api ga ko'chirildi"
fi

# Move frontend to apps/web
echo -e "${BLUE}🌐 Step 4: Moving frontend to apps/web${NC}"
if [ -d "front-main" ]; then
    cp -r front-main/* apps/web/
    print_status "Frontend apps/web ga ko'chirildi"
fi

# Organize deployment scripts
echo -e "${BLUE}📜 Step 5: Organizing deployment scripts${NC}"
mv *.sh scripts/deployment/ 2>/dev/null || true
mv docker-compose*.yml docker/ 2>/dev/null || true
mv nginx*.conf docker/ 2>/dev/null || true
mv Dockerfile docker/ 2>/dev/null || true
print_status "Deployment skriptlari tartibga solindi"

# Organize documentation
echo -e "${BLUE}📚 Step 6: Organizing documentation${NC}"
mv *.md docs/ 2>/dev/null || true
# Keep main README in root
cp docs/README.md . 2>/dev/null || true
print_status "Hujjatlar tartibga solindi"

# Create root package.json (monorepo)
echo -e "${BLUE}📦 Step 7: Creating monorepo package.json${NC}"
cat > package.json << 'EOF'
{
  "name": "inbola-marketplace",
  "version": "1.0.0",
  "description": "INBOLA Kids Marketplace - Professional E-commerce Platform",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "dev:api": "npm run dev --workspace=apps/api",
    "dev:web": "npm run dev --workspace=apps/web",
    "build": "npm run build --workspaces",
    "build:api": "npm run build --workspace=apps/api",
    "build:web": "npm run build --workspace=apps/web",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "deploy": "./scripts/deployment/FINAL_PRODUCTION_DEPLOY.sh",
    "setup": "./scripts/development/setup.sh"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/Xorazm92/marketplace.git"
  },
  "keywords": [
    "ecommerce",
    "marketplace",
    "kids",
    "nextjs",
    "nestjs",
    "typescript",
    "postgresql",
    "graphql"
  ],
  "author": "INBOLA Development Team",
  "license": "MIT"
}
EOF
print_status "Root package.json yaratildi"

# Create shared package
echo -e "${BLUE}🔗 Step 8: Creating shared packages${NC}"
cat > packages/shared/package.json << 'EOF'
{
  "name": "@inbola/shared",
  "version": "1.0.0",
  "description": "Shared utilities and types for INBOLA Marketplace",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
EOF

mkdir -p packages/shared/src
cat > packages/shared/src/index.ts << 'EOF'
// Shared types and utilities
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'parent' | 'child' | 'seller';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  ageGroup: string;
}

export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  PRODUCTS: '/products',
  ORDERS: '/orders',
} as const;

export const PAYMENT_METHODS = {
  CLICK: 'click',
  PAYME: 'payme',
  CASH: 'cash',
} as const;
EOF

cat > packages/shared/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

print_status "Shared package yaratildi"

# Update API package.json
echo -e "${BLUE}🔧 Step 9: Updating API configuration${NC}"
if [ -f "apps/api/package.json" ]; then
    # Add workspace reference to shared package
    sed -i '/"dependencies": {/a\    "@inbola/shared": "workspace:*",' apps/api/package.json
fi
print_status "API konfiguratsiyasi yangilandi"

# Update Web package.json
echo -e "${BLUE}🌐 Step 10: Updating Web configuration${NC}"
if [ -f "apps/web/package.json" ]; then
    # Add workspace reference to shared package
    sed -i '/"dependencies": {/a\    "@inbola/shared": "workspace:*",' apps/web/package.json
fi
print_status "Web konfiguratsiyasi yangilandi"

# Create development setup script
echo -e "${BLUE}🛠️ Step 11: Creating development scripts${NC}"
cat > scripts/development/setup.sh << 'EOF'
#!/bin/bash
echo "🚀 Setting up INBOLA Marketplace development environment"

# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces

# Build shared packages
npm run build --workspace=packages/shared

# Setup database
cd apps/api
npx prisma generate
npx prisma migrate dev

echo "✅ Development environment ready!"
echo "Run: npm run dev"
EOF

chmod +x scripts/development/setup.sh
print_status "Development skriptlari yaratildi"

# Create GitHub Actions workflow
echo -e "${BLUE}🔄 Step 12: Creating CI/CD workflow${NC}"
cat > .github/workflows/ci.yml << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: inbola_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build shared packages
      run: npm run build --workspace=packages/shared
    
    - name: Lint
      run: npm run lint
    
    - name: Test
      run: npm run test
    
    - name: Build
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to production
      run: echo "Deploy to production server"
EOF

print_status "CI/CD workflow yaratildi"

# Create Docker configuration
echo -e "${BLUE}🐳 Step 13: Creating Docker configuration${NC}"
cat > docker/docker-compose.yml << 'EOF'
version: '3.8'

services:
  api:
    build:
      context: ../apps/api
      dockerfile: ../../docker/Dockerfile.api
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://inbola_user:password@postgres:5432/inbola_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  web:
    build:
      context: ../apps/web
      dockerfile: ../../docker/Dockerfile.web
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3001
    depends_on:
      - api

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: inbola_db
      POSTGRES_USER: inbola_user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
EOF

print_status "Docker konfiguratsiyasi yaratildi"

# Create main README
echo -e "${BLUE}📖 Step 14: Creating main README${NC}"
cat > README.md << 'EOF'
# 🎯 INBOLA Kids Marketplace

> Professional e-commerce platform for children aged 3-12 and their parents

[![CI/CD](https://github.com/Xorazm92/marketplace/actions/workflows/ci.yml/badge.svg)](https://github.com/Xorazm92/marketplace/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🏗️ Architecture

This is a monorepo containing:

- **apps/api** - NestJS backend with GraphQL API
- **apps/web** - Next.js frontend application  
- **packages/shared** - Shared types and utilities

## 🚀 Quick Start

```bash
# Setup development environment
npm run setup

# Start development servers
npm run dev

# Build for production
npm run build

# Deploy to production
npm run deploy
```

## 📚 Documentation

- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE_INBOLA.md)
- [Development Setup](./docs/DEVELOPMENT.md)

## 🛠️ Tech Stack

- **Backend**: NestJS, GraphQL, Prisma, PostgreSQL
- **Frontend**: Next.js, TypeScript, Apollo Client
- **Infrastructure**: Docker, Nginx, PM2
- **CI/CD**: GitHub Actions

## 📦 Project Structure

```
inbola-marketplace/
├── apps/
│   ├── api/           # NestJS backend
│   └── web/           # Next.js frontend
├── packages/
│   └── shared/        # Shared utilities
├── scripts/
│   ├── deployment/    # Deployment scripts
│   └── development/   # Development tools
├── docker/            # Docker configurations
├── docs/              # Documentation
└── .github/           # CI/CD workflows
```

## 🌟 Features

- 🛒 Complete e-commerce functionality
- 🛡️ Child safety features
- 💳 Payment integrations (Click, Payme)
- 👥 Multi-role user system
- 📱 PWA support
- 🔐 JWT authentication

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
EOF

print_status "Main README yaratildi"

# Clean up old structure
echo -e "${BLUE}🧹 Step 15: Cleaning up old structure${NC}"
print_warning "Eski papkalarni o'chirish uchun qo'lda tasdiqlash kerak"
print_info "Keyingi qadamlar:"
print_info "1. Yangi struktura ishlashini tekshiring"
print_info "2. Git commit qiling"
print_info "3. Eski papkalarni o'chiring: rm -rf backend-main front-main"

echo -e "${PURPLE}================================================================${NC}"
echo -e "${GREEN}🎉 INTERNATIONAL STANDARDS RESTRUCTURE COMPLETED!${NC}"
echo -e "${PURPLE}================================================================${NC}"
echo ""
echo -e "${BLUE}📋 YANGI STRUKTURA:${NC}"
echo -e "${YELLOW}✅ Monorepo with workspaces${NC}"
echo -e "${YELLOW}✅ Standard directory structure${NC}"
echo -e "${YELLOW}✅ Shared packages${NC}"
echo -e "${YELLOW}✅ CI/CD workflows${NC}"
echo -e "${YELLOW}✅ Docker configuration${NC}"
echo -e "${YELLOW}✅ Development scripts${NC}"
echo ""
echo -e "${BLUE}🚀 KEYINGI QADAMLAR:${NC}"
echo "1. npm run setup    # Development environment"
echo "2. npm run dev      # Start development"
echo "3. npm run build    # Test production build"
echo "4. git add .        # Commit changes"
echo ""
echo -e "${GREEN}✅ LOYIHANGIZ XALQARO STANDARTLARGA MOSLASHTIRILDI!${NC}"
echo -e "${PURPLE}================================================================${NC}"
EOF
