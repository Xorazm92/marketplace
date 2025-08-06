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
