-- Test product'lar yaratish
-- Avval kerakli ma'lumotlarni qo'shamiz

-- User yaratish
INSERT INTO "user" (first_name, last_name, password, is_active, "createdAt", "updatedAt")
VALUES
  ('Test', 'User', '$2b$10$hashedpassword', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Brand yaratish
INSERT INTO "brand" (name, logo, "createdAt", "updatedAt")
VALUES
  ('INBOLA', 'default-brand-logo.png', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Category yaratish
INSERT INTO "category" (name, slug, description, is_active, sort_order, "createdAt", "updatedAt")
VALUES
  ('Bolalar O''yinchoqlari', 'bolalar-oyinchoqlari', 'Bolalar uchun o''yinchoqlar', true, 0, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Currency yaratish
INSERT INTO "currency" (code, name, symbol, "createdAt", "updatedAt")
VALUES
  ('UZS', 'O''zbek so''mi', 'so''m', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Test product yaratish
INSERT INTO "product" (
  title, user_id, brand_id, price, currency_id, description,
  negotiable, condition, phone_number, is_checked, is_active,
  category_id, weight, age_range, material, color, size,
  manufacturer, safety_info, "createdAt", "updatedAt"
)
VALUES
  (
    'Bolalar uchun matematik o''yin',
    (SELECT id FROM "user" WHERE first_name = 'Test' LIMIT 1),
    (SELECT id FROM "brand" WHERE name = 'INBOLA' LIMIT 1),
    25000,
    (SELECT id FROM "currency" WHERE code = 'UZS' LIMIT 1),
    'Bolalar uchun matematik ko''nikmalarni rivojlantiruvchi o''yin',
    true, true, '+998901234567', 'APPROVED', true,
    (SELECT id FROM "category" WHERE slug = 'bolalar-oyinchoqlari' LIMIT 1),
    '0.5', '3-8', 'Plastik', 'Ko''p rangli', 'O''rta',
    'INBOLA', 'Bolalar uchun xavfsiz', NOW(), NOW()
  )
ON CONFLICT DO NOTHING;
