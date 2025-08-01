/*
  Warnings:

  - You are about to alter the column `dimensions` on the `product` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `features` on the `product` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - Added the required column `total_price` to the `cart_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_price` to the `cart_item` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "product_variants" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "price_adjustment" DECIMAL NOT NULL DEFAULT 0,
    "sku" TEXT,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_collections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "product_collection_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "collection_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_collection_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "product_collections" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_collection_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_attributes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_filterable" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "product_attribute_values" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "attribute_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_attribute_values_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_attribute_values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "product_attributes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_recommendations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "recommended_product_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "score" DECIMAL NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_recommendations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_recommendations_recommended_product_id_fkey" FOREIGN KEY ("recommended_product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_views" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,
    "viewed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_views_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "search_queries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "query" TEXT NOT NULL,
    "user_id" INTEGER,
    "results_count" INTEGER NOT NULL DEFAULT 0,
    "clicked_product_id" INTEGER,
    "ip_address" TEXT,
    "searched_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_queries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "search_queries_clicked_product_id_fkey" FOREIGN KEY ("clicked_product_id") REFERENCES "product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cart_item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cart_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "variant_id" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL NOT NULL,
    "total_price" DECIMAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cart_item_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cart_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cart_item_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_cart_item" ("cart_id", "createdAt", "id", "product_id", "quantity", "updatedAt") SELECT "cart_id", "createdAt", "id", "product_id", "quantity", "updatedAt" FROM "cart_item";
DROP TABLE "cart_item";
ALTER TABLE "new_cart_item" RENAME TO "cart_item";
CREATE UNIQUE INDEX "cart_item_cart_id_product_id_variant_id_key" ON "cart_item"("cart_id", "product_id", "variant_id");
CREATE TABLE "new_product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "user_id" INTEGER,
    "brand_id" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    "original_price" DECIMAL,
    "discount_percentage" INTEGER DEFAULT 0,
    "currency_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "short_description" TEXT,
    "negotiable" BOOLEAN NOT NULL DEFAULT false,
    "condition" TEXT NOT NULL DEFAULT 'new',
    "phone_number" TEXT NOT NULL,
    "address_id" INTEGER,
    "slug" TEXT,
    "is_top" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_bestseller" BOOLEAN NOT NULL DEFAULT false,
    "is_checked" TEXT NOT NULL DEFAULT 'PENDING',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "category_id" INTEGER,
    "subcategory_id" INTEGER,
    "sku" TEXT,
    "barcode" TEXT,
    "weight" DECIMAL,
    "dimensions" JSONB,
    "age_range" TEXT,
    "material" TEXT,
    "color" TEXT,
    "size" TEXT,
    "manufacturer" TEXT,
    "brand_name" TEXT,
    "safety_info" TEXT,
    "features" JSONB,
    "specifications" JSONB,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "tags" TEXT,
    "search_keywords" TEXT,
    "availability_status" TEXT NOT NULL DEFAULT 'in_stock',
    "min_order_quantity" INTEGER NOT NULL DEFAULT 1,
    "max_order_quantity" INTEGER,
    "shipping_weight" DECIMAL,
    "shipping_dimensions" JSONB,
    "origin_country" TEXT,
    "warranty_period" TEXT,
    "return_policy" TEXT,
    "care_instructions" TEXT,
    "safety_warnings" TEXT,
    "certifications" JSONB,
    "educational_value" TEXT,
    "skill_development" JSONB,
    "play_pattern" TEXT,
    "assembly_required" BOOLEAN NOT NULL DEFAULT false,
    "battery_required" BOOLEAN NOT NULL DEFAULT false,
    "choking_hazard" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "product_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "product_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "product_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_product" ("address_id", "age_range", "brand_id", "category_id", "color", "condition", "createdAt", "currency_id", "description", "dimensions", "features", "id", "is_active", "is_checked", "is_deleted", "is_top", "like_count", "manufacturer", "material", "meta_description", "meta_title", "negotiable", "phone_number", "price", "safety_info", "size", "sku", "slug", "specifications", "tags", "title", "updatedAt", "user_id", "view_count", "weight") SELECT "address_id", "age_range", "brand_id", "category_id", "color", "condition", "createdAt", "currency_id", "description", "dimensions", "features", "id", "is_active", "is_checked", "is_deleted", "is_top", "like_count", "manufacturer", "material", "meta_description", "meta_title", "negotiable", "phone_number", "price", "safety_info", "size", "sku", "slug", "specifications", "tags", "title", "updatedAt", "user_id", "view_count", "weight" FROM "product";
DROP TABLE "product";
ALTER TABLE "new_product" RENAME TO "product";
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");
CREATE UNIQUE INDEX "product_sku_key" ON "product"("sku");
CREATE UNIQUE INDEX "product_barcode_key" ON "product"("barcode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_collections_slug_key" ON "product_collections"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_collection_items_collection_id_product_id_key" ON "product_collection_items"("collection_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_attributes_name_key" ON "product_attributes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_attribute_values_product_id_attribute_id_key" ON "product_attribute_values"("product_id", "attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_recommendations_product_id_recommended_product_id_type_key" ON "product_recommendations"("product_id", "recommended_product_id", "type");
