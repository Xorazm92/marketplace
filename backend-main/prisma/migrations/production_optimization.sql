-- INBOLA Production Database Optimization
-- Bu migration production performance uchun muhim indexlar va optimizatsiyalarni qo'shadi

-- ===========================================
-- 📊 PERFORMANCE INDEXES
-- ===========================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('english', description));

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Messages table indexes (for chat)
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- OTP codes table indexes
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_created_at ON otp_codes(created_at);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_purpose ON otp_codes(purpose);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Addresses table indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_default ON addresses(is_default);

-- Payment transactions indexes
CREATE INDEX IF NOT EXISTS idx_payments_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payment_transactions(created_at);

-- ===========================================
-- 🔍 COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ===========================================

-- Products search and filtering
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category_id, status);
CREATE INDEX IF NOT EXISTS idx_products_seller_status ON products(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(price, status);
CREATE INDEX IF NOT EXISTS idx_products_created_status ON products(created_at, status);

-- Orders filtering
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_seller_status ON orders(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON orders(created_at, status);

-- Reviews filtering
CREATE INDEX IF NOT EXISTS idx_reviews_product_rating ON reviews(product_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_user_created ON reviews(user_id, created_at);

-- Messages conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_full ON messages(sender_id, receiver_id, created_at DESC);

-- ===========================================
-- 🛡️ SECURITY CONSTRAINTS
-- ===========================================

-- Ensure phone numbers are unique
ALTER TABLE users ADD CONSTRAINT unique_phone_number UNIQUE (phone_number);

-- Ensure email addresses are unique (if not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) WHERE email IS NOT NULL;

-- Prevent duplicate active OTP codes
CREATE UNIQUE INDEX IF NOT EXISTS idx_otp_active_unique ON otp_codes(phone_number, purpose) 
WHERE expires_at > NOW() AND is_used = false;

-- ===========================================
-- 📊 STATISTICS AND MAINTENANCE
-- ===========================================

-- Update table statistics for better query planning
ANALYZE users;
ANALYZE products;
ANALYZE orders;
ANALYZE order_items;
ANALYZE categories;
ANALYZE reviews;
ANALYZE messages;
ANALYZE otp_codes;
ANALYZE notifications;
ANALYZE addresses;
ANALYZE payment_transactions;

-- ===========================================
-- 🔧 PERFORMANCE SETTINGS
-- ===========================================

-- Set autovacuum settings for high-traffic tables
ALTER TABLE products SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE orders SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE messages SET (
  autovacuum_vacuum_scale_factor = 0.2,
  autovacuum_analyze_scale_factor = 0.1
);

ALTER TABLE otp_codes SET (
  autovacuum_vacuum_scale_factor = 0.2,
  autovacuum_analyze_scale_factor = 0.1
);

-- ===========================================
-- 🧹 CLEANUP PROCEDURES
-- ===========================================

-- Function to cleanup expired OTP codes
CREATE OR REPLACE FUNCTION cleanup_expired_otp_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes 
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '30 days' 
  AND is_read = true;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old messages (optional)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM messages 
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- ⏰ SCHEDULED MAINTENANCE
-- ===========================================

-- Note: These should be run via cron job or scheduled task
-- Example cron entries:
-- # Cleanup expired OTP codes every hour
-- 0 * * * * psql -d inbola_db -c "SELECT cleanup_expired_otp_codes();"
-- 
-- # Cleanup old notifications daily at 2 AM
-- 0 2 * * * psql -d inbola_db -c "SELECT cleanup_old_notifications();"
-- 
-- # Cleanup old messages monthly
-- 0 3 1 * * psql -d inbola_db -c "SELECT cleanup_old_messages();"

-- ===========================================
-- 📈 MONITORING VIEWS
-- ===========================================

-- View for monitoring table sizes
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- View for monitoring index usage
CREATE OR REPLACE VIEW index_usage AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- View for monitoring slow queries (requires pg_stat_statements extension)
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
-- 
-- CREATE OR REPLACE VIEW slow_queries AS
-- SELECT 
--   query,
--   calls,
--   total_time,
--   mean_time,
--   rows
-- FROM pg_stat_statements
-- WHERE mean_time > 100  -- queries taking more than 100ms on average
-- ORDER BY mean_time DESC;

COMMIT;
