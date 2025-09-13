
-- Create seller table
CREATE TABLE IF NOT EXISTS "seller" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER UNIQUE NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "company_name" VARCHAR(255) NOT NULL,
  "business_registration" VARCHAR(100) UNIQUE NOT NULL,
  "tax_id" VARCHAR(50) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20) NOT NULL,
  "business_address" TEXT NOT NULL,
  "description" TEXT,
  "website" VARCHAR(255),
  "business_categories" TEXT[] DEFAULT '{}',
  "bank_account" VARCHAR(100) NOT NULL,
  "bank_name" VARCHAR(100) NOT NULL,
  "status" VARCHAR(20) DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED')),
  "is_verified" BOOLEAN DEFAULT FALSE,
  "is_active" BOOLEAN DEFAULT FALSE,
  "verification_notes" TEXT,
  "verified_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Update product table to add seller relationship
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "seller_id" INTEGER REFERENCES "seller"("id") ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_seller_user_id" ON "seller"("user_id");
CREATE INDEX IF NOT EXISTS "idx_seller_status" ON "seller"("status");
CREATE INDEX IF NOT EXISTS "idx_seller_is_verified" ON "seller"("is_verified");
CREATE INDEX IF NOT EXISTS "idx_product_seller_id" ON "product"("seller_id");

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seller_updated_at BEFORE UPDATE ON "seller" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
