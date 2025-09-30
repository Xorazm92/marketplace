-- Seed currencies
INSERT INTO currency (name, code, symbol, "createdAt", "updatedAt") VALUES
('O''zbekiston so''mi', 'UZS', 'so''m', NOW(), NOW()),
('US Dollar', 'USD', '$', NOW(), NOW()),
('Russian Ruble', 'RUB', '₽', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

SELECT id, name, code, symbol FROM currency;
