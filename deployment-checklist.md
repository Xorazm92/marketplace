# 🚀 INBOLA Marketplace Deployment Checklist

## ✅ Issues Fixed

### Critical Issues Resolved:
- ✅ **Database Configuration**: Fixed SQLite → PostgreSQL in Prisma schema
- ✅ **Docker Paths**: Updated Dockerfiles from `apps/` to `backend-main/front-main`
- ✅ **Port Conflicts**: Standardized backend port to 3001
- ✅ **Duplicate Directories**: Removed redundant `apps/` folder
- ✅ **Auth Module Consolidation**: Merged UserAuthModule into AuthModule
- ✅ **Environment Setup**: Created automated setup script

### Optimizations Made:
- ✅ **Project Structure**: Cleaned up duplicate auth modules
- ✅ **Docker Configuration**: Fixed nginx.conf and container paths
- ✅ **Environment Variables**: Created comprehensive .env templates
- ✅ **API Testing**: Created comprehensive curl test script

## 🔧 Pre-Deployment Steps

### 1. Environment Setup
```bash
# Run environment setup
./setup-env.sh

# Install dependencies (requires Node.js 18+)
cd backend-main && npm install
cd ../front-main && npm install
```

### 2. Database Setup
```bash
cd backend-main
npm run db:generate
npm run db:migrate
npm run seed  # Optional: seed initial data
```

### 3. Build Applications
```bash
# Backend build
cd backend-main && npm run build

# Frontend build  
cd front-main && npm run build
```

### 4. Test Endpoints
```bash
# Start development server
npm run dev

# In another terminal, run tests
./test-api-endpoints.sh
```

## 🐳 Docker Deployment

### Production Deployment
```bash
# Build and start services
docker-compose -f docker-compose.yml up -d

# Check service health
docker-compose ps
docker-compose logs api
docker-compose logs web
```

### Environment Variables Required
Create `.env.prod` file with:
- `DATABASE_URL` - PostgreSQL connection string
- `ACCESS_TOKEN_KEY` - JWT secret (64+ chars)
- `REFRESH_TOKEN_KEY` - JWT refresh secret (64+ chars)
- `FRONTEND_URL` - Production frontend URL
- `SMS_TOKEN` - SMS service token
- `REDIS_URL` - Redis connection string

## 📊 Health Checks

### Endpoints to Verify:
- ✅ `GET /health` - Backend health
- ✅ `GET /api-docs` - API documentation
- ✅ `GET /` - Frontend homepage
- ✅ `POST /graphql` - GraphQL endpoint

### Database Connections:
- ✅ PostgreSQL connection
- ✅ Redis connection (optional)
- ✅ Prisma migrations applied

## 🛡️ Security Checklist

- ✅ JWT secrets configured
- ✅ CORS origins restricted
- ✅ Helmet security headers enabled
- ✅ Rate limiting configured
- ✅ Input validation enabled
- ✅ File upload restrictions set

## 🚀 Deployment Commands

### Quick Start (Development)
```bash
./setup-env.sh
npm run install:all
npm run dev
```

### Production Deployment
```bash
# Copy production environment
cp .env.prod.example .env.prod
# Edit .env.prod with actual values

# Deploy with Docker
docker-compose -f docker-compose.yml up -d

# Or deploy with PM2
npm run build
npm run start
```

## 📝 Post-Deployment Verification

1. **API Health**: `curl http://your-domain/health`
2. **Frontend**: Visit `http://your-domain`
3. **Admin Panel**: `http://your-domain/admin`
4. **API Docs**: `http://your-domain/api-docs`
5. **GraphQL**: `http://your-domain/graphql`

## 🔍 Monitoring

- Check PM2 status: `pm2 status`
- View logs: `pm2 logs`
- Monitor resources: `pm2 monit`
- Docker logs: `docker-compose logs -f`

## 🐛 Troubleshooting

### Common Issues:
1. **Port conflicts**: Ensure ports 3000, 3001 are available
2. **Database connection**: Check PostgreSQL credentials
3. **Node.js version**: Requires Node.js 18+
4. **Dependencies**: Run `npm install` in both directories
5. **Environment variables**: Verify all required vars are set

### Debug Commands:
```bash
# Check Node.js version
node --version  # Should be 18+

# Test database connection
cd backend-main && npm run db:studio

# Check running processes
ps aux | grep node

# Check port usage
netstat -tulpn | grep :3001
```

## 📈 Performance Optimization

- ✅ Gzip compression enabled
- ✅ Static file caching configured
- ✅ Database connection pooling
- ✅ Redis caching (optional)
- ✅ Image optimization for uploads

## 🎯 Next Steps

1. **SSL Certificate**: Configure HTTPS for production
2. **CDN Setup**: Configure static asset delivery
3. **Backup Strategy**: Setup automated database backups
4. **Monitoring**: Setup application monitoring (Sentry, etc.)
5. **CI/CD Pipeline**: Automate deployment process
