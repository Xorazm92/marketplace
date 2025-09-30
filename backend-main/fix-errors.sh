#!/bin/bash

# Fix ID type mismatches - convert string to number
find src -name "*.service.ts" -exec sed -i 's/where: { id: productId }/where: { id: parseInt(productId) }/g' {} \;
find src -name "*.service.ts" -exec sed -i 's/where: { id: userId }/where: { id: parseInt(userId) }/g' {} \;
find src -name "*.service.ts" -exec sed -i 's/where: { id: orderId }/where: { id: parseInt(orderId) }/g' {} \;
find src -name "*.service.ts" -exec sed -i 's/where: { id: categoryId }/where: { id: parseInt(categoryId) }/g' {} \;

# Fix product_id type mismatches
find src -name "*.service.ts" -exec sed -i 's/product_id: productId/product_id: parseInt(productId)/g' {} \;

# Fix category_id type mismatches  
find src -name "*.service.ts" -exec sed -i 's/category_id: categoryId/category_id: parseInt(categoryId)/g' {} \;

echo "Basic fixes applied!"
