-- 🚀 INBOLA Kids Marketplace - Performance Indexes
-- Generated: 2025-01-31

-- ===== USER INDEXES =====
-- Phone number index for fast OTP lookup
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ===== PRODUCT INDEXES =====
-- Category index for product filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at);

-- Full-text search index for product names and descriptions
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('english', description));

-- Composite index for category + price filtering
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category_id, price);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category_id, status);

-- ===== ORDER INDEXES =====
-- User orders index
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);

-- Order number index for fast lookup
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- Composite index for user + status filtering
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at);

-- ===== OTP INDEXES =====
-- Phone number index for OTP verification
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_created ON otp_codes(created_at);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);

-- Composite index for phone + expiry
CREATE INDEX IF NOT EXISTS idx_otp_phone_expires ON otp_codes(phone_number, expires_at);

-- ===== CART INDEXES =====
-- User cart index
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_created_at ON cart_items(created_at);

-- Composite index for user + product
CREATE INDEX IF NOT EXISTS idx_cart_user_product ON cart_items(user_id, product_id);

-- ===== WISHLIST INDEXES =====
-- User wishlist index
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON wishlist(created_at);

-- Composite index for user + product
CREATE INDEX IF NOT EXISTS idx_wishlist_user_product ON wishlist(user_id, product_id);

-- ===== REVIEW INDEXES =====
-- Product reviews index
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Composite index for product + rating
CREATE INDEX IF NOT EXISTS idx_reviews_product_rating ON reviews(product_id, rating);

-- ===== CATEGORY INDEXES =====
-- Category hierarchy index
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- ===== BRAND INDEXES =====
-- Brand status index
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(status);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

-- ===== PAYMENT INDEXES =====
-- Payment order index
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- ===== NOTIFICATION INDEXES =====
-- User notifications index
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Composite index for user + status
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);

-- ===== CHILD SAFETY INDEXES =====
-- Child safety logs index
CREATE INDEX IF NOT EXISTS idx_child_safety_user ON child_safety_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_child_safety_action ON child_safety_logs(action);
CREATE INDEX IF NOT EXISTS idx_child_safety_created_at ON child_safety_logs(created_at);

-- ===== SESSION INDEXES =====
-- User sessions index
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON user_sessions(created_at);

-- ===== AUDIT LOG INDEXES =====
-- Audit logs index
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ===== PERFORMANCE STATISTICS =====
-- Update table statistics for better query planning
ANALYZE users;
ANALYZE products;
ANALYZE orders;
ANALYZE otp_codes;
ANALYZE cart_items;
ANALYZE wishlist;
ANALYZE reviews;
ANALYZE categories;
ANALYZE brands;
ANALYZE payments;
ANALYZE notifications;

-- ===== CLEANUP OLD DATA =====
-- Delete expired OTP codes (older than 1 day)
DELETE FROM otp_codes WHERE expires_at < NOW() - INTERVAL '1 day';

-- Delete old audit logs (older than 90 days)
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- Delete expired sessions
DELETE FROM user_sessions WHERE expires_at < NOW();

-- ===== VACUUM AND REINDEX =====
-- Vacuum tables to reclaim space
VACUUM ANALYZE users;
VACUUM ANALYZE products;
VACUUM ANALYZE orders;
VACUUM ANALYZE otp_codes;

COMMIT;