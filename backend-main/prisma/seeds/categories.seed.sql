-- Seed data for hierarchical categories (Bolalar marketplace)

-- Main categories
INSERT INTO categories (id, name, slug, parent_id, icon, color, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Kiyim-kechak', 'kiyim-kechak', NULL, 'fas fa-tshirt', '#FF6B6B', 1),
('550e8400-e29b-41d4-a716-446655440002', 'O''yinchoqlar', 'oyinchoqlar', NULL, 'fas fa-gamepad', '#4ECDC4', 2),
('550e8400-e29b-41d4-a716-446655440003', 'Kitoblar', 'kitoblar', NULL, 'fas fa-book', '#45B7D1', 3),
('550e8400-e29b-41d4-a716-446655440004', 'Sport anjomlar', 'sport-anjomlar', NULL, 'fas fa-futbol', '#96CEB4', 4),
('550e8400-e29b-41d4-a716-446655440005', 'Maktab buyumlari', 'maktab-buyumlari', NULL, 'fas fa-graduation-cap', '#FFEAA7', 5),
('550e8400-e29b-41d4-a716-446655440006', 'Chaqaloq mahsulotlari', 'chaqaloq-mahsulotlari', NULL, 'fas fa-baby', '#FD79A8', 6);

-- Subcategories
INSERT INTO categories (id, name, slug, parent_id, icon, color, sort_order) VALUES
-- Kiyim-kechak subcategories
('550e8400-e29b-41d4-a716-446655440011', 'Ko''ylaklar', 'koylaklar', '550e8400-e29b-41d4-a716-446655440001', 'fas fa-female', '#FF8A80', 1),
('550e8400-e29b-41d4-a716-446655440012', 'Shimlar', 'shimlar', '550e8400-e29b-41d4-a716-446655440001', 'fas fa-male', '#81C784', 2),
('550e8400-e29b-41d4-a716-446655440013', 'Oyoq kiyim', 'oyoq-kiyim', '550e8400-e29b-41d4-a716-446655440001', 'fas fa-shoe-prints', '#FFB74D', 3),

-- O'yinchoqlar subcategories  
('550e8400-e29b-41d4-a716-446655440021', 'Konstruktorlar', 'konstruktorlar', '550e8400-e29b-41d4-a716-446655440002', 'fas fa-cubes', '#4FC3F7', 1),
('550e8400-e29b-41d4-a716-446655440022', 'Qo''g''irchoqlar', 'qogirchoqlar', '550e8400-e29b-41d4-a716-446655440002', 'fas fa-female', '#F8BBD9', 2),
('550e8400-e29b-41d4-a716-446655440023', 'Mashinalar', 'mashinalar', '550e8400-e29b-41d4-a716-446655440002', 'fas fa-car', '#81C784', 3),

-- Kitoblar subcategories
('550e8400-e29b-41d4-a716-446655440031', 'Ertaklar', 'ertaklar', '550e8400-e29b-41d4-a716-446655440003', 'fas fa-magic', '#E1BEE7', 1),
('550e8400-e29b-41d4-a716-446655440032', 'Ta''lim kitoblari', 'talim-kitoblari', '550e8400-e29b-41d4-a716-446655440003', 'fas fa-chalkboard-teacher', '#AED581', 2),

-- Sport anjomlar subcategories
('550e8400-e29b-41d4-a716-446655440041', 'To''plar', 'toplar', '550e8400-e29b-41d4-a716-446655440004', 'fas fa-futbol', '#81C784', 1),
('550e8400-e29b-41d4-a716-446655440042', 'Velosipedlar', 'velosipedlar', '550e8400-e29b-41d4-a716-446655440004', 'fas fa-bicycle', '#FFB74D', 2);
