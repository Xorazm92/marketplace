-- Test product image'larni qo'shish
-- Avval mavjud product'larni tekshiramiz
INSERT INTO "product_image" (url, product_id, "createdAt", "updatedAt")
VALUES
  ('/uploads/product-1.svg', 1, NOW(), NOW()),
  ('/uploads/product-2.svg', 1, NOW(), NOW()),
  ('/uploads/product-3.svg', 1, NOW(), NOW()),
  ('/uploads/test-product.svg', 1, NOW(), NOW())
ON CONFLICT DO NOTHING;
