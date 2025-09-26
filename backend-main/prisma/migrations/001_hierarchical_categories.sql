-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enhanced categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  icon VARCHAR,
  color VARCHAR,
  description TEXT,
  meta_title VARCHAR,
  meta_description VARCHAR,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create product_categories junction table
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Create indexes for performance
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_product_categories_product ON product_categories(product_id);
CREATE INDEX idx_product_categories_category ON product_categories(category_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get category tree with counts
CREATE OR REPLACE FUNCTION get_category_tree_with_counts()
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    parent_id UUID,
    icon VARCHAR,
    color VARCHAR,
    description TEXT,
    meta_title VARCHAR,
    meta_description VARCHAR,
    sort_order INT,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    children_count BIGINT,
    product_count BIGINT,
    level INT,
    path TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE category_tree AS (
        -- Base case: root categories
        SELECT 
            c.id,
            c.name,
            c.slug,
            c.parent_id,
            c.icon,
            c.color,
            c.description,
            c.meta_title,
            c.meta_description,
            c.sort_order,
            c.is_active,
            c.created_at,
            c.updated_at,
            0::INT as level,
            c.slug::TEXT as path
        FROM categories c
        WHERE c.parent_id IS NULL
        
        UNION ALL
        
        -- Recursive case: child categories
        SELECT 
            c.id,
            c.name,
            c.slug,
            c.parent_id,
            c.icon,
            c.color,
            c.description,
            c.meta_title,
            c.meta_description,
            c.sort_order,
            c.is_active,
            c.created_at,
            c.updated_at,
            ct.level + 1,
            ct.path || '/' || c.slug
        FROM categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
    ),
    category_counts AS (
        SELECT 
            ct.id,
            ct.name,
            ct.slug,
            ct.parent_id,
            ct.icon,
            ct.color,
            ct.description,
            ct.meta_title,
            ct.meta_description,
            ct.sort_order,
            ct.is_active,
            ct.created_at,
            ct.updated_at,
            ct.level,
            ct.path,
            COALESCE(children.count, 0) as children_count,
            COALESCE(products.count, 0) as product_count
        FROM category_tree ct
        LEFT JOIN (
            SELECT parent_id, COUNT(*) as count
            FROM categories
            WHERE is_active = true
            GROUP BY parent_id
        ) children ON ct.id = children.parent_id
        LEFT JOIN (
            SELECT pc.category_id, COUNT(*) as count
            FROM product_categories pc
            GROUP BY pc.category_id
        ) products ON ct.id = products.category_id
    )
    SELECT * FROM category_counts
    ORDER BY level, sort_order, name;
END;
$$ LANGUAGE plpgsql;

-- Function to prevent cycles in category hierarchy
CREATE OR REPLACE FUNCTION prevent_category_cycle()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the new parent_id would create a cycle
    IF NEW.parent_id IS NOT NULL THEN
        WITH RECURSIVE ancestors AS (
            SELECT id, parent_id, 1 as level
            FROM categories
            WHERE id = NEW.parent_id
            
            UNION ALL
            
            SELECT c.id, c.parent_id, a.level + 1
            FROM categories c
            INNER JOIN ancestors a ON c.id = a.parent_id
            WHERE a.level < 10 -- Prevent infinite recursion
        )
        SELECT INTO NEW.parent_id
        CASE 
            WHEN EXISTS (SELECT 1 FROM ancestors WHERE id = NEW.id) 
            THEN NULL 
            ELSE NEW.parent_id 
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_category_cycle_trigger
    BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION prevent_category_cycle();

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(base_slug TEXT, category_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    new_slug TEXT := base_slug;
    counter INT := 1;
BEGIN
    -- Check if slug already exists (excluding current category if updating)
    WHILE EXISTS (
        SELECT 1 FROM categories 
        WHERE slug = new_slug 
        AND (category_id IS NULL OR id != category_id)
    ) LOOP
        counter := counter + 1;
        new_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;
