-- Seed test user for product testing
INSERT INTO "user" (first_name, last_name, email, password, is_active, "createdAt", "updatedAt") VALUES
('Test', 'User', 'test@inbola.uz', '$2a$10$XQqY9Z1JZ9Z1JZ9Z1JZ9ZeK9Z1JZ9Z1JZ9Z1JZ9Z1JZ9Z1JZ9Z1JZ', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

SELECT id, first_name, last_name, email FROM "user";
