-- Add missing fields to product table
ALTER TABLE "product" 
ADD COLUMN IF NOT EXISTS "slug" VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS "original_price" DECIMAL,
ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "view_count" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "age_range" VARCHAR,
ADD COLUMN IF NOT EXISTS "safety_info" TEXT,
ADD COLUMN IF NOT EXISTS "educational_value" TEXT,
ADD COLUMN IF NOT EXISTS "material" VARCHAR,
ADD COLUMN IF NOT EXISTS "color" VARCHAR,
ADD COLUMN IF NOT EXISTS "size" VARCHAR,
ADD COLUMN IF NOT EXISTS "manufacturer" VARCHAR,
ADD COLUMN IF NOT EXISTS "weight" DECIMAL,
ADD COLUMN IF NOT EXISTS "dimensions" TEXT,
ADD COLUMN IF NOT EXISTS "features" TEXT;

-- Add address_id column and foreign key if tables exist
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "address_id" INTEGER;

-- Update existing products to set defaults for new fields
UPDATE "product" 
SET 
  "is_deleted" = COALESCE("is_deleted", false),
  "view_count" = COALESCE("view_count", 0)
WHERE "is_deleted" IS NULL OR "view_count" IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_product_slug" ON "product"("slug") WHERE "slug" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_product_is_deleted" ON "product"("is_deleted");
CREATE INDEX IF NOT EXISTS "idx_product_is_active" ON "product"("is_active");
CREATE INDEX IF NOT EXISTS "idx_product_category" ON "product"("category_id");
CREATE INDEX IF NOT EXISTS "idx_product_brand" ON "product"("brand_id");

COMMENT ON COLUMN "product"."age_range" IS 'Target age range for child products (e.g., 3-6, 6-12)';
COMMENT ON COLUMN "product"."safety_info" IS 'Child safety information and certifications';
COMMENT ON COLUMN "product"."educational_value" IS 'Educational benefits of the product';
