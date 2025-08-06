-- Test data for ecommerce app

-- Insert currencies
INSERT INTO currency (code, name, symbol, "createdAt", "updatedAt") VALUES
('USD', 'US Dollar', '$', NOW(), NOW()),
('UZS', 'Uzbek Som', 'so''m', NOW(), NOW());

-- Insert brands
INSERT INTO brand (name, logo, "createdAt", "updatedAt") VALUES
('Nike', 'nike-logo.png', NOW(), NOW()),
('Apple', 'apple-logo.png', NOW(), NOW()),
('Samsung', 'samsung-logo.png', NOW(), NOW());

-- Insert colors
INSERT INTO color (name, "createdAt", "updatedAt") VALUES
('Black', NOW(), NOW()),
('White', NOW(), NOW()),
('Blue', NOW(), NOW()),
('Red', NOW(), NOW()),
('Green', NOW(), NOW());

-- Insert models
INSERT INTO model (name, brand_id, "createdAt", "updatedAt") VALUES
('Air Max 90', 1, NOW(), NOW()),
('iPhone 15', 2, NOW(), NOW()),
('Galaxy S24', 3, NOW(), NOW());

-- Insert payment methods
INSERT INTO payment_method (name) VALUES
('Credit Card'),
('PayPal'),
('Cash on Delivery');

-- Insert products
INSERT INTO product (title, description, price, currency_id, brand_id, model_id, color_id, user_id, condition, "createdAt", "updatedAt") VALUES
('Nike Air Max 90 Black', 'Classic Nike Air Max 90 sneakers in black color', 120.00, 1, 1, 1, 1, 1, true, NOW(), NOW()),
('iPhone 15 Blue 128GB', 'Latest iPhone 15 with 128GB storage in blue color', 999.00, 1, 2, 2, 3, 1, true, NOW(), NOW()),
('Samsung Galaxy S24 White', 'Samsung Galaxy S24 smartphone in white color', 799.00, 1, 3, 3, 2, 1, true, NOW(), NOW());
