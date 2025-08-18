-- Final Child Safety Features Migration
-- This migration adds comprehensive child safety and educational features

-- Insert default age groups (with updatedAt)
INSERT INTO "age_group" ("name", "min_age", "max_age", "description", "icon", "color", "sort_order", "updatedAt") VALUES
('0-6 oy', 0, 6, 'Yangi tugilgan chaqaloqlar uchun', 'baby', '#FFB6C1', 1, NOW()),
('6-12 oy', 6, 12, 'Chaqaloqlar uchun', 'baby-bottle', '#87CEEB', 2, NOW()),
('1-2 yosh', 12, 24, 'Kichik bolalar uchun', 'toddler', '#98FB98', 3, NOW()),
('2-3 yosh', 24, 36, 'Orta yoshdagi bolalar uchun', 'child', '#DDA0DD', 4, NOW()),
('3-5 yosh', 36, 60, 'Katta bolalar uchun', 'preschool', '#F0E68C', 5, NOW()),
('5-7 yosh', 60, 84, 'Maktab yoshidagi bolalar uchun', 'school', '#FFA07A', 6, NOW()),
('7+ yosh', 84, NULL, 'Katta bolalar va osmirlar uchun', 'teen', '#B0C4DE', 7, NOW())
ON CONFLICT DO NOTHING;

-- Insert default safety certifications
INSERT INTO "safety_certification" ("name", "code", "description", "required_for_age", "logo", "updatedAt") VALUES
('CE Marking', 'CE', 'European safety standard', 'All ages', 'ce-logo.png', NOW()),
('CPSIA', 'CPSIA', 'Consumer Product Safety Improvement Act', 'Under 12 years', 'cpsia-logo.png', NOW()),
('ASTM F963', 'ASTM-F963', 'Standard Consumer Safety Specification for Toy Safety', 'All ages', 'astm-logo.png', NOW()),
('EN71', 'EN71', 'European standard for toy safety', 'All ages', 'en71-logo.png', NOW()),
('ISO 8124', 'ISO-8124', 'International standard for toy safety', 'All ages', 'iso-logo.png', NOW())
ON CONFLICT DO NOTHING;

-- Insert default educational categories
INSERT INTO "educational_category" ("name", "description", "icon", "color", "sort_order", "updatedAt") VALUES
('STEM', 'Science, Technology, Engineering, Mathematics', 'science', '#FF6B6B', 1, NOW()),
('Sanat va Ijod', 'Rassomlik, musiqa, hunarmandchilik', 'art', '#4ECDC4', 2, NOW()),
('Til organish', 'Ingliz tili, matematika, oqish', 'language', '#45B7D1', 3, NOW()),
('Jismoniy rivojlanish', 'Harakat, sport, koordinatsiya', 'sports', '#96CEB4', 4, NOW()),
('Ijtimoiy konikmalar', 'Muloqot, jamoa ishi, hissiy intellekt', 'social', '#FFEAA7', 5, NOW()),
('Mantiq va fikrlash', 'Pazlllar, strategiya oyinlari', 'puzzle', '#DDA0DD', 6, NOW()),
('Tabiat va atrof-muhit', 'Hayvonlar, osimliklar, ekologiya', 'nature', '#98FB98', 7, NOW())
ON CONFLICT DO NOTHING;

-- Insert default event types
INSERT INTO "event_type" ("name", "description", "icon", "color", "sort_order", "updatedAt") VALUES
('Tugilgan kun', 'Tugilgan kun uchun sovgalar', 'birthday', '#FF6B6B', 1, NOW()),
('Yangi yil', 'Yangi yil bayrami uchun sovgalar', 'christmas', '#4ECDC4', 2, NOW()),
('Navruz', 'Navruz bayrami uchun sovgalar', 'spring', '#45B7D1', 3, NOW()),
('Ramazon', 'Ramazon bayrami uchun sovgalar', 'ramadan', '#96CEB4', 4, NOW()),
('Maktab', 'Maktab uchun kerakli narsalar', 'school', '#FFEAA7', 5, NOW()),
('Yozgi dam olish', 'Yozgi dam olish uchun oyinchoqlar', 'summer', '#DDA0DD', 6, NOW()),
('Oqish', 'Oqish va talim uchun materiallar', 'education', '#98FB98', 7, NOW())
ON CONFLICT DO NOTHING;

-- Insert default gift wrap options
INSERT INTO "gift_wrap" ("name", "description", "price", "for_age", "for_gender", "updatedAt") VALUES
('Oddiy orash', 'Oddiy qogoz bilan orash', 5.00, 'All ages', 'Unisex', NOW()),
('Rangli orash', 'Rangli qogoz va lenta bilan', 10.00, 'All ages', 'Unisex', NOW()),
('Ogil bolalar uchun', 'Ogil bolalar uchun maxsus dizayn', 15.00, '2-12 yosh', 'Male', NOW()),
('Qiz bolalar uchun', 'Qiz bolalar uchun maxsus dizayn', 15.00, '2-12 yosh', 'Female', NOW()),
('Chaqaloqlar uchun', 'Chaqaloqlar uchun xavfsiz materiallar', 20.00, '0-2 yosh', 'Unisex', NOW()),
('Premium orash', 'Yuqori sifatli materiallar bilan', 25.00, 'All ages', 'Unisex', NOW())
ON CONFLICT DO NOTHING;

-- Add foreign key constraints to Product table (fixed syntax)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'product_age_group_id_fkey') THEN
        ALTER TABLE "product" ADD CONSTRAINT "product_age_group_id_fkey" 
            FOREIGN KEY ("age_group_id") REFERENCES "age_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'product_educational_category_id_fkey') THEN
        ALTER TABLE "product" ADD CONSTRAINT "product_educational_category_id_fkey" 
            FOREIGN KEY ("educational_category_id") REFERENCES "educational_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'product_event_type_id_fkey') THEN
        ALTER TABLE "product" ADD CONSTRAINT "product_event_type_id_fkey" 
            FOREIGN KEY ("event_type_id") REFERENCES "event_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
