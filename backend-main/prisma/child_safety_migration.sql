-- Child Safety Features Migration
-- This migration adds comprehensive child safety and educational features

-- 1. Create ChildProfile table
CREATE TABLE IF NOT EXISTS "child_profile" (
    "id" SERIAL PRIMARY KEY,
    "parent_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" TEXT,
    "interests" JSONB,
    "allergies" JSONB,
    "avatar" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "child_profile_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 2. Create AgeGroup table
CREATE TABLE IF NOT EXISTS "age_group" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "min_age" INTEGER NOT NULL,
    "max_age" INTEGER,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 3. Create SafetyCertification table
CREATE TABLE IF NOT EXISTS "safety_certification" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "required_for_age" TEXT,
    "logo" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 4. Create ProductSafetyCertification table
CREATE TABLE IF NOT EXISTS "product_safety_certification" (
    "id" SERIAL PRIMARY KEY,
    "product_id" INTEGER NOT NULL,
    "certification_id" INTEGER NOT NULL,
    "certificate_number" TEXT,
    "issued_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_safety_certification_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_safety_certification_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "safety_certification"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_safety_certification_product_id_certification_id_key" UNIQUE ("product_id", "certification_id")
);

-- 5. Create ParentalControl table
CREATE TABLE IF NOT EXISTS "parental_control" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "child_profile_id" INTEGER NOT NULL,
    "spending_limit" DECIMAL(65,30),
    "daily_spending_limit" DECIMAL(65,30),
    "allowed_categories" JSONB,
    "blocked_categories" JSONB,
    "time_restrictions" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "parental_control_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "parental_control_child_profile_id_fkey" FOREIGN KEY ("child_profile_id") REFERENCES "child_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "parental_control_user_id_child_profile_id_key" UNIQUE ("user_id", "child_profile_id")
);

-- 6. Create EventType table
CREATE TABLE IF NOT EXISTS "event_type" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 7. Create EducationalCategory table
CREATE TABLE IF NOT EXISTS "educational_category" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 8. Create GiftWrap table
CREATE TABLE IF NOT EXISTS "gift_wrap" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "image_url" TEXT,
    "for_age" TEXT,
    "for_gender" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 9. Create ProductRecommendationEngine table
CREATE TABLE IF NOT EXISTS "product_recommendation_engine" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "child_profile_id" INTEGER,
    "child_age" INTEGER,
    "preferences" JSONB NOT NULL,
    "recommended_products" JSONB NOT NULL,
    "recommendation_score" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_recommendation_engine_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_recommendation_engine_child_profile_id_fkey" FOREIGN KEY ("child_profile_id") REFERENCES "child_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 10. Add new columns to Product table
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "age_group_id" INTEGER;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "educational_category_id" INTEGER;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "event_type_id" INTEGER;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "difficulty_level" TEXT;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "play_time" TEXT;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "player_count" TEXT;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "learning_objectives" JSONB;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "developmental_skills" JSONB;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "parental_guidance" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "multilingual_support" JSONB;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "recommended_age_min" INTEGER;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "recommended_age_max" INTEGER;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "gender_specific" TEXT;

-- 11. Add foreign key constraints to Product table
ALTER TABLE "product" ADD CONSTRAINT IF NOT EXISTS "product_age_group_id_fkey" 
    FOREIGN KEY ("age_group_id") REFERENCES "age_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product" ADD CONSTRAINT IF NOT EXISTS "product_educational_category_id_fkey" 
    FOREIGN KEY ("educational_category_id") REFERENCES "educational_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product" ADD CONSTRAINT IF NOT EXISTS "product_event_type_id_fkey" 
    FOREIGN KEY ("event_type_id") REFERENCES "event_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 12. Insert default age groups
INSERT INTO "age_group" ("name", "min_age", "max_age", "description", "icon", "color", "sort_order") VALUES
('0-6 oy', 0, 6, 'Yangi tug\'ilgan chaqaloqlar uchun', 'baby', '#FFB6C1', 1),
('6-12 oy', 6, 12, 'Chaqaloqlar uchun', 'baby-bottle', '#87CEEB', 2),
('1-2 yosh', 12, 24, 'Kichik bolalar uchun', 'toddler', '#98FB98', 3),
('2-3 yosh', 24, 36, 'O\'rta yoshdagi bolalar uchun', 'child', '#DDA0DD', 4),
('3-5 yosh', 36, 60, 'Katta bolalar uchun', 'preschool', '#F0E68C', 5),
('5-7 yosh', 60, 84, 'Maktab yoshidagi bolalar uchun', 'school', '#FFA07A', 6),
('7+ yosh', 84, NULL, 'Katta bolalar va o\'smirlar uchun', 'teen', '#B0C4DE', 7)
ON CONFLICT DO NOTHING;

-- 13. Insert default safety certifications
INSERT INTO "safety_certification" ("name", "code", "description", "required_for_age", "logo") VALUES
('CE Marking', 'CE', 'European safety standard', 'All ages', 'ce-logo.png'),
('CPSIA', 'CPSIA', 'Consumer Product Safety Improvement Act', 'Under 12 years', 'cpsia-logo.png'),
('ASTM F963', 'ASTM-F963', 'Standard Consumer Safety Specification for Toy Safety', 'All ages', 'astm-logo.png'),
('EN71', 'EN71', 'European standard for toy safety', 'All ages', 'en71-logo.png'),
('ISO 8124', 'ISO-8124', 'International standard for toy safety', 'All ages', 'iso-logo.png')
ON CONFLICT DO NOTHING;

-- 14. Insert default educational categories
INSERT INTO "educational_category" ("name", "description", "icon", "color", "sort_order") VALUES
('STEM', 'Science, Technology, Engineering, Mathematics', 'science', '#FF6B6B', 1),
('San\'at va Ijod', 'Rassomlik, musiqa, hunarmandchilik', 'art', '#4ECDC4', 2),
('Til o\'rganish', 'Ingliz tili, matematika, o\'qish', 'language', '#45B7D1', 3),
('Jismoniy rivojlanish', 'Harakat, sport, koordinatsiya', 'sports', '#96CEB4', 4),
('Ijtimoiy ko\'nikmalar', 'Muloqot, jamoa ishi, hissiy intellekt', 'social', '#FFEAA7', 5),
('Mantiq va fikrlash', 'Pazlllar, strategiya o\'yinlari', 'puzzle', '#DDA0DD', 6),
('Tabiat va atrof-muhit', 'Hayvonlar, o\'simliklar, ekologiya', 'nature', '#98FB98', 7)
ON CONFLICT DO NOTHING;

-- 15. Insert default event types
INSERT INTO "event_type" ("name", "description", "icon", "color", "sort_order") VALUES
('Tug\'ilgan kun', 'Tug\'ilgan kun uchun sovg\'alar', 'birthday', '#FF6B6B', 1),
('Yangi yil', 'Yangi yil bayrami uchun sovg\'alar', 'christmas', '#4ECDC4', 2),
('Navruz', 'Navruz bayrami uchun sovg\'alar', 'spring', '#45B7D1', 3),
('Ramazon', 'Ramazon bayrami uchun sovg\'alar', 'ramadan', '#96CEB4', 4),
('Maktab', 'Maktab uchun kerakli narsalar', 'school', '#FFEAA7', 5),
('Yozgi dam olish', 'Yozgi dam olish uchun o\'yinchoqlar', 'summer', '#DDA0DD', 6),
('O\'qish', 'O\'qish va ta\'lim uchun materiallar', 'education', '#98FB98', 7)
ON CONFLICT DO NOTHING;

-- 16. Insert default gift wrap options
INSERT INTO "gift_wrap" ("name", "description", "price", "for_age", "for_gender") VALUES
('Oddiy o\'rash', 'Oddiy qog\'oz bilan o\'rash', 5.00, 'All ages', 'Unisex'),
('Rangli o\'rash', 'Rangli qog\'oz va lenta bilan', 10.00, 'All ages', 'Unisex'),
('O\'g\'il bolalar uchun', 'O\'g\'il bolalar uchun maxsus dizayn', 15.00, '2-12 yosh', 'Male'),
('Qiz bolalar uchun', 'Qiz bolalar uchun maxsus dizayn', 15.00, '2-12 yosh', 'Female'),
('Chaqaloqlar uchun', 'Chaqaloqlar uchun xavfsiz materiallar', 20.00, '0-2 yosh', 'Unisex'),
('Premium o\'rash', 'Yuqori sifatli materiallar bilan', 25.00, 'All ages', 'Unisex')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "child_profile_parent_id_idx" ON "child_profile"("parent_id");
CREATE INDEX IF NOT EXISTS "age_group_sort_order_idx" ON "age_group"("sort_order");
CREATE INDEX IF NOT EXISTS "product_age_group_id_idx" ON "product"("age_group_id");
CREATE INDEX IF NOT EXISTS "product_educational_category_id_idx" ON "product"("educational_category_id");
CREATE INDEX IF NOT EXISTS "product_event_type_id_idx" ON "product"("event_type_id");
CREATE INDEX IF NOT EXISTS "product_recommended_age_min_idx" ON "product"("recommended_age_min");
CREATE INDEX IF NOT EXISTS "product_recommended_age_max_idx" ON "product"("recommended_age_max");
