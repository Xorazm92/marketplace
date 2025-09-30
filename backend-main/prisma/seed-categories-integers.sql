-- Seed data for categories with integer IDs (matching CategoryService in-memory data)

-- Clear existing categories if any
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- Main categories (level 0)
INSERT INTO categories (name, slug, parent_id, is_active, created_at, updated_at) VALUES
('Kiyim-kechak', 'kiyim-kechak', NULL, true, NOW(), NOW()),
('O''yinchoqlar', 'oyinchoqlar', NULL, true, NOW(), NOW()),
('Kitoblar', 'kitoblar', NULL, true, NOW(), NOW()),
('Sport', 'sport', NULL, true, NOW(), NOW()),
('Maktab', 'maktab', NULL, true, NOW(), NOW()),
('Chaqaloq', 'chaqaloq', NULL, true, NOW(), NOW());

-- Subcategories (level 1)
INSERT INTO categories (name, slug, parent_id, is_active, created_at, updated_at) VALUES
-- Kiyim-kechak subcategories (parent_id = 1)
('Ichki kiyim', 'ichki-kiyim', 1, true, NOW(), NOW()),
('Tashqi kiyim', 'tashqi-kiyim', 1, true, NOW(), NOW()),
('Oyoq kiyim', 'oyoq-kiyim', 1, true, NOW(), NOW()),

-- O'yinchoqlar subcategories (parent_id = 2)
('Konstruktor', 'konstruktor', 2, true, NOW(), NOW()),
('Yumshoq o''yinchoqlar', 'yumshoq-oyinchoqlar', 2, true, NOW(), NOW()),
('Mashinalar', 'mashinalar', 2, true, NOW(), NOW()),

-- Kitoblar subcategories (parent_id = 3)
('Ta''lim kitoblari', 'talim-kitoblari', 3, true, NOW(), NOW()),
('Ertaklar', 'ertaklar', 3, true, NOW(), NOW()),
('Ranglashtirish kitoblari', 'ranglashtirish-kitoblari', 3, true, NOW(), NOW()),

-- Sport subcategories (parent_id = 4)
('To''plar', 'toplar', 4, true, NOW(), NOW()),
('Velosipedlar', 'velosipedlar', 4, true, NOW(), NOW()),

-- Maktab subcategories (parent_id = 5)
('Ruchkalar va qalamlar', 'ruchkalar-va-qalamlar', 5, true, NOW(), NOW()),
('Daftarlar', 'daftarlar', 5, true, NOW(), NOW()),

-- Chaqaloq subcategories (parent_id = 6)
('Cho''tka va shampun', 'chotka-va-shampun', 6, true, NOW(), NOW()),
('Chaqaloq kiyimi', 'chaqaloq-kiyimi', 6, true, NOW(), NOW());

-- Verify the data
SELECT id, name, slug, parent_id, is_active FROM categories ORDER BY id;
