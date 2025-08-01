-- PostgreSQL initialization script for Marketplace
-- This script runs when the database is first created

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant all privileges to marketplace_user
GRANT ALL PRIVILEGES ON DATABASE marketplace_db TO marketplace_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO marketplace_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO marketplace_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO marketplace_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO marketplace_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO marketplace_user;
