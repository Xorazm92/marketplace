-- Barcha mahsulotlarni approve qilish
UPDATE "product" 
SET 
  "is_checked" = 'APPROVED',
  "is_active" = true,
  "updatedAt" = NOW()
WHERE "is_deleted" = false;

-- Natijani tekshirish
SELECT 
  id, 
  title, 
  is_checked, 
  is_active, 
  is_deleted,
  "createdAt"
FROM "product" 
ORDER BY "createdAt" DESC 
LIMIT 10;
