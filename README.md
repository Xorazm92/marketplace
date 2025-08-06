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
