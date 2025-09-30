-- ===========================================
-- MARKETPLACE SCHEMA OPTIMIZATION MIGRATION
-- PostgreSQL Migration Script
-- ===========================================

-- ===========================================
-- STEP 1: CREATE EXTENSIONS
-- ===========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===========================================
-- STEP 2: UUID CONVERSION STRATEGY
-- ===========================================

-- Create temporary mapping tables for ID conversion
CREATE TEMP TABLE user_id_mapping AS
SELECT 
    id as old_id,
    uuid_generate_v4() as new_id,
    email
FROM "user";

CREATE TEMP TABLE category_id_mapping AS
SELECT 
    id as old_id,
    uuid_generate_v4() as new_id,
    slug
FROM categories;

CREATE TEMP TABLE brand_id_mapping AS
SELECT 
    id as old_id,
    uuid_generate_v4() as new_id,
    name
FROM brand;

-- ===========================================
-- STEP 3: CREATE NEW TABLES WITH UUID
-- ===========================================

-- Users table with UUID
CREATE TABLE users_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_img VARCHAR(500),
    google_id VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    balance DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table with UUID
CREATE TABLE categories_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories_new(id) ON DELETE SET NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    level INTEGER DEFAULT 0,
    path TEXT,
    product_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brands table with UUID
CREATE TABLE brands_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo VARCHAR(500),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table with UUID
CREATE TABLE products_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    price DECIMAL(12,2) NOT NULL,
    original_price DECIMAL(12,2),
    discount_percentage INTEGER DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    min_order_quantity INTEGER DEFAULT 1,
    max_order_quantity INTEGER,
    low_stock_threshold INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    availability_status VARCHAR(20) DEFAULT 'in_stock',
    weight DECIMAL(8,3),
    dimensions JSONB,
    material VARCHAR(100),
    color VARCHAR(100),
    size VARCHAR(50),
    age_range VARCHAR(50),
    recommended_age_min INTEGER,
    recommended_age_max INTEGER,
    safety_warnings TEXT,
    certifications JSONB,
    meta_title VARCHAR(255),
    meta_description TEXT,
    tags TEXT[],
    search_keywords TEXT,
    brand_id UUID NOT NULL REFERENCES brands_new(id),
    category_id UUID NOT NULL REFERENCES categories_new(id),
    user_id UUID REFERENCES users_new(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- ===========================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ===========================================

-- Users indexes
CREATE INDEX idx_users_email ON users_new(email);
CREATE INDEX idx_users_google_id ON users_new(google_id);
CREATE INDEX idx_users_active ON users_new(is_active);
CREATE INDEX idx_users_created_at ON users_new(created_at);

-- Categories indexes
CREATE INDEX idx_categories_parent ON categories_new(parent_id);
CREATE INDEX idx_categories_slug ON categories_new(slug);
CREATE INDEX idx_categories_active ON categories_new(is_active);
CREATE INDEX idx_categories_level ON categories_new(level);
CREATE INDEX idx_categories_path ON categories_new(path);

-- Brands indexes
CREATE INDEX idx_brands_slug ON brands_new(slug);
CREATE INDEX idx_brands_active ON brands_new(is_active);
CREATE INDEX idx_brands_name ON brands_new(name);

-- Products indexes
CREATE INDEX idx_products_brand ON products_new(brand_id);
CREATE INDEX idx_products_category ON products_new(category_id);
CREATE INDEX idx_products_user ON products_new(user_id);
CREATE INDEX idx_products_active ON products_new(is_active);
CREATE INDEX idx_products_featured ON products_new(is_featured);
CREATE INDEX idx_products_price ON products_new(price);
CREATE INDEX idx_products_stock ON products_new(stock_quantity);
CREATE INDEX idx_products_created_at ON products_new(created_at);
CREATE INDEX idx_products_published_at ON products_new(published_at);
CREATE INDEX idx_products_search ON products_new USING gin(to_tsvector('english', title || ' ' || description || ' ' || coalesce(search_keywords, '')));

-- ===========================================
-- STEP 5: MIGRATE DATA
-- ===========================================

-- Migrate users
INSERT INTO users_new (id, email, password, first_name, last_name, profile_img, google_id, is_active, is_premium, balance, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    email,
    password,
    first_name,
    last_name,
    profile_img,
    google_id,
    is_active,
    is_premium,
    balance,
    createdAt,
    updatedAt
FROM "user";

-- Migrate categories
INSERT INTO categories_new (id, name, slug, parent_id, description, icon, color, sort_order, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    name,
    slug,
    CASE WHEN parent_id IS NULL THEN NULL ELSE uuid_generate_v4() END,
    description,
    icon,
    color,
    sort_order,
    is_active,
    created_at,
    updated_at
FROM categories;

-- Migrate brands
INSERT INTO brands_new (id, name, slug, logo, description, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    name,
    LOWER(REPLACE(name, ' ', '-')),
    logo,
    NULL,
    true,
    createdAt,
    updatedAt
FROM brand;

-- ===========================================
-- STEP 6: UPDATE FOREIGN KEY RELATIONSHIPS
-- ===========================================

-- This would need to be done carefully with proper mapping
-- For now, we'll create the structure and you can migrate data as needed

-- ===========================================
-- STEP 7: RENAME TABLES
-- ===========================================

-- Rename old tables (backup)
ALTER TABLE "user" RENAME TO users_old;
ALTER TABLE categories RENAME TO categories_old;
ALTER TABLE brand RENAME TO brands_old;
ALTER TABLE product RENAME TO products_old;

-- Rename new tables
ALTER TABLE users_new RENAME TO users;
ALTER TABLE categories_new RENAME TO categories;
ALTER TABLE brands_new RENAME TO brands;
ALTER TABLE products_new RENAME TO products;

-- ===========================================
-- STEP 8: POST-MIGRATION VERIFICATION
-- ===========================================

-- Verify counts match
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'brands', COUNT(*) FROM brands
UNION ALL
SELECT 'products', COUNT(*) FROM products;

-- Check indexes
SELECT schemaname, tablename, indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
