#!/bin/bash

echo "🔧 Class nomlarini tuzatish..."

# Fix Review.service class name
sed -i 's/export class Review\.serviceService/export class ReviewService/g' src/review/review.service.ts

# Fix UserAuth.service class name  
sed -i 's/export class UserAuth\.serviceService/export class UserAuthService/g' src/user-auth/user-auth.service.ts

# Fix product.service.ts - remove duplicate methods at the end
tail -n +1 src/product/product.service.ts | head -n 290 > /tmp/product.service.clean.ts
echo "}" >> /tmp/product.service.clean.ts
cp /tmp/product.service.clean.ts src/product/product.service.ts

# Fix admin.service.ts - check for unclosed brackets
# Add closing bracket if needed
if ! tail -1 src/admin/admin.service.ts | grep -q "^}"; then
  echo "}" >> src/admin/admin.service.ts
fi

echo "✅ Class nomlari tuzatildi!"
echo "📊 Build..."
npm run build 2>&1 | tail -3
