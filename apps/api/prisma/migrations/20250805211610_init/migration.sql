-- CreateTable
CREATE TABLE "admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_creator" BOOLEAN NOT NULL DEFAULT false,
    "activation_link" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "hashed_refresh_token" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profile_img" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "birth_date" TEXT,
    "hashed_refresh_token" TEXT,
    "last_online" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "slug" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "region" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "district" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "region_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "district_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "address" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "lat" TEXT,
    "long" TEXT,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "region_id" INTEGER,
    "district_id" INTEGER,
    "address" TEXT NOT NULL,
    "phone_number" TEXT,
    "postal_code" TEXT,
    "address_type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "address_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "address_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "brand" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "model" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "model_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "color" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "currency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "phone_number" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phone_number" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "otp_code" TEXT,
    "otp_expires_at" DATETIME,
    "otp_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_otp_sent" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "phone_number_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "otp_verification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phone_number" TEXT NOT NULL,
    "otp_code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "email" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "activation_link" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "email_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_method" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "payment_method_id" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payment_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payment_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product" (
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

-- CreateTable
CREATE TABLE "product_image" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_image_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "otp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expired_time" DATETIME NOT NULL,
    "phone_number" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Chatroom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "userId" INTEGER NOT NULL,
    "chatroomId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Message_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatroomUsers" (
    "chatroomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("chatroomId", "userId"),
    CONSTRAINT "ChatroomUsers_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatroomUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "parent_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cart_item" (
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

-- CreateTable
CREATE TABLE "wishlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wishlist_item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wishlist_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wishlist_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "wishlist_item_wishlist_id_fkey" FOREIGN KEY ("wishlist_id") REFERENCES "wishlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order_number" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "total_amount" DECIMAL NOT NULL,
    "discount_amount" DECIMAL NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL NOT NULL DEFAULT 0,
    "shipping_amount" DECIMAL NOT NULL DEFAULT 0,
    "final_amount" DECIMAL NOT NULL,
    "currency_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT,
    "shipping_address_id" INTEGER,
    "billing_address_id" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "order_billing_address_id_fkey" FOREIGN KEY ("billing_address_id") REFERENCES "address" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "order_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "address" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL NOT NULL,
    "total_price" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order_id" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "payment_method" TEXT NOT NULL,
    "transaction_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "gateway_response" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "order_payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_tracking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_tracking_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "review_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "review_image" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "review_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "review_image_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "coupon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "value" DECIMAL NOT NULL,
    "min_order_amount" DECIMAL,
    "max_discount_amount" DECIMAL,
    "usage_limit" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "user_usage_limit" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" DATETIME NOT NULL,
    "valid_until" DATETIME NOT NULL,
    "applicable_categories" TEXT,
    "applicable_products" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "is_in_stock" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_movement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventory_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "reference_id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_movement_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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

-- CreateTable
CREATE TABLE "_ChatroomUsers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ChatroomUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Chatroom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ChatroomUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_activation_link_key" ON "admin"("activation_link");

-- CreateIndex
CREATE UNIQUE INDEX "user_slug_key" ON "user"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "brand_name_key" ON "brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "model_name_key" ON "model"("name");

-- CreateIndex
CREATE UNIQUE INDEX "color_name_key" ON "color"("name");

-- CreateIndex
CREATE UNIQUE INDEX "currency_name_key" ON "currency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "currency_code_key" ON "currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "phone_number_phone_number_key" ON "phone_number"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "email_email_key" ON "email"("email");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_sku_key" ON "product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_barcode_key" ON "product"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cart_user_id_key" ON "cart"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_cart_id_product_id_variant_id_key" ON "cart_item"("cart_id", "product_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_user_id_key" ON "wishlist"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_item_wishlist_id_product_id_key" ON "wishlist_item"("wishlist_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_order_number_key" ON "order"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "review_product_id_user_id_key" ON "review"("product_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_code_key" ON "coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_product_id_key" ON "inventory"("product_id");

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

-- CreateIndex
CREATE UNIQUE INDEX "_ChatroomUsers_AB_unique" ON "_ChatroomUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatroomUsers_B_index" ON "_ChatroomUsers"("B");
