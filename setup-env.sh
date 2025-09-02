#!/bin/bash

# INBOLA Marketplace Environment Setup Script
echo "🚀 Setting up INBOLA Marketplace environment..."

# Create backend .env file
cat > backend-main/.env << 'EOF'
# INBOLA Development Environment Variables

# ===========================================
# 🌍 ENVIRONMENT CONFIGURATION
# ===========================================
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# ===========================================
# 🗄️ DATABASE CONFIGURATION
# ===========================================
DATABASE_URL="postgresql://inbola_user:InBoLa_Dev_P@ssw0rd_2024@localhost:5432/inbola_db"

# ===========================================
# 🔐 JWT CONFIGURATION
# ===========================================
ACCESS_TOKEN_KEY="InBoLa_Dev_@ccess_T0ken_K3y_2024_Development_Secret"
REFRESH_TOKEN_KEY="InBoLa_Dev_R3fr3sh_T0ken_K3y_2024_Development_Secret"
ACCESS_TOKEN_TIME="15m"
REFRESH_TOKEN_TIME="7d"

# ===========================================
# 📱 SMS CONFIGURATION (Development)
# ===========================================
SMS_TOKEN="dev-token"
SMS_SERVICE_URL="https://notify.eskiz.uz/api/message/sms/send"

# ===========================================
# 🌐 FRONTEND CONFIGURATION
# ===========================================
FRONTEND_URL="http://localhost:3000"

# ===========================================
# 📁 FILE UPLOAD CONFIGURATION
# ===========================================
UPLOAD_PATH="./public/uploads"
MAX_FILE_SIZE=5242880

# ===========================================
# 🔴 REDIS CONFIGURATION (Optional for dev)
# ===========================================
REDIS_URL="redis://localhost:6379"

# ===========================================
# 📊 DEVELOPMENT FLAGS
# ===========================================
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true
EOF

# Create frontend .env file
cat > front-main/.env.local << 'EOF'
# INBOLA Frontend Development Environment

NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOF

echo "✅ Environment files created successfully!"
echo "📝 Backend env: backend-main/.env"
echo "📝 Frontend env: front-main/.env.local"
echo ""
echo "🔧 Next steps:"
echo "1. Install dependencies: npm run install:all"
echo "2. Setup database: cd backend-main && npm run db:migrate"
echo "3. Start development: npm run dev"
