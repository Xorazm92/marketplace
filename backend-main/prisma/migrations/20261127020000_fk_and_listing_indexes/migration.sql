-- Tashqi kalit va ro'yxat so'rovlari uchun indekslar (faqat qo'shadi).
-- O'lchov: docs/QUALITY_BAR.md (D8) — 100 ming buyurtmali sintetik bazada EXPLAIN ANALYZE.
-- CreateIndex
CREATE INDEX "address_user_id_idx" ON "address"("user_id");

-- CreateIndex
CREATE INDEX "order_shipping_address_id_idx" ON "order"("shipping_address_id");

-- CreateIndex
CREATE INDEX "order_item_order_id_idx" ON "order_item"("order_id");

-- CreateIndex
CREATE INDEX "order_item_product_id_idx" ON "order_item"("product_id");

-- CreateIndex
CREATE INDEX "order_tracking_order_id_idx" ON "order_tracking"("order_id");

-- CreateIndex
CREATE INDEX "product_createdAt_idx" ON "product"("createdAt");

-- CreateIndex
CREATE INDEX "product_category_id_idx" ON "product"("category_id");

-- CreateIndex
CREATE INDEX "product_image_product_id_idx" ON "product_image"("product_id");

