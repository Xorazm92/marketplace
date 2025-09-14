# Database Setup Guide for Windows

This guide will help you set up the required databases (PostgreSQL and Redis) for the marketplace application on Windows.

## Option 1: Using Docker (Recommended)

If you have Docker Desktop installed on Windows, this is the easiest method:

### 1. Create docker-compose.yml for databases

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: inbola_user
      POSTGRES_PASSWORD: inbola_password
      POSTGRES_DB: inbola_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass inbola_redis_password
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 2. Run the databases

```bash
# Start the databases
docker-compose up -d

# Check if they're running
docker-compose ps
```

## Option 2: Manual Installation

### PostgreSQL Setup

1. **Download PostgreSQL**
   - Go to https://www.postgresql.org/download/windows/
   - Download and install PostgreSQL 15 or later
   - During installation, set the password for the `postgres` user

2. **Create Database and User**
   ```sql
   -- Connect to PostgreSQL using pgAdmin or psql
   CREATE USER inbola_user WITH PASSWORD 'inbola_password';
   CREATE DATABASE inbola_db OWNER inbola_user;
   GRANT ALL PRIVILEGES ON DATABASE inbola_db TO inbola_user;
   ```

3. **Update connection if needed**
   - The default connection should work: `postgresql://inbola_user:inbola_password@localhost:5432/inbola_db`

### Redis Setup

1. **Download Redis for Windows**
   - Go to https://github.com/microsoftarchive/redis/releases
   - Download the latest MSI installer
   - Install Redis with default settings

2. **Configure Redis with password**
   - Edit the Redis configuration file (usually in `C:\Program Files\Redis\`)
   - Add: `requirepass inbola_redis_password`
   - Restart Redis service

## Option 3: Using WSL2 (Windows Subsystem for Linux)

If you have WSL2 enabled:

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Setup PostgreSQL
sudo -u postgres psql
CREATE USER inbola_user WITH PASSWORD 'inbola_password';
CREATE DATABASE inbola_db OWNER inbola_user;
GRANT ALL PRIVILEGES ON DATABASE inbola_db TO inbola_user;
\q

# Install Redis
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Add: requirepass inbola_redis_password

# Start services
sudo service postgresql start
sudo service redis-server start
```

## Environment Configuration

Make sure your `.env` file in the `backend-main` directory has the correct database URLs:

```env
# PostgreSQL
DATABASE_URL=postgresql://inbola_user:inbola_password@localhost:5432/inbola_db

# Redis
REDIS_URL=redis://:inbola_redis_password@localhost:6379
```

## Database Migration and Seeding

After setting up the databases:

1. **Generate Prisma Client**
   ```bash
   cd backend-main
   npm run db:generate
   ```

2. **Run Database Migrations**
   ```bash
   npm run db:migrate
   ```

3. **Seed the Database (Optional)**
   ```bash
   npm run seed
   ```

## Testing Database Connection

You can test if your databases are working:

### Test PostgreSQL
```bash
# Using psql (if installed)
psql -h localhost -U inbola_user -d inbola_db

# Or using a GUI tool like pgAdmin
```

### Test Redis
```bash
# Using redis-cli (if installed)
redis-cli -h localhost -p 6379 -a inbola_redis_password
```

## Troubleshooting

### Common Issues

1. **PostgreSQL connection refused**
   - Make sure PostgreSQL service is running
   - Check if port 5432 is open
   - Verify credentials in `.env` file

2. **Redis connection issues**
   - Ensure Redis service is running
   - Check if port 6379 is open
   - Verify password configuration

3. **Permission errors**
   - Make sure the database user has proper permissions
   - Check if Windows Firewall is blocking connections

### Useful Commands

```bash
# Check if PostgreSQL is running (Windows)
Get-Service postgresql*

# Check if Redis is running (Windows)
Get-Service redis

# Test network connectivity
Test-NetConnection localhost -Port 5432  # PostgreSQL
Test-NetConnection localhost -Port 6379  # Redis
```

## Next Steps

After setting up the databases:

1. Run the deployment script: `.\deploy-windows.ps1`
2. Or use the batch file: `deploy-windows.bat`
3. Test the API endpoints with: `.\test-api-windows.ps1`

The application should now be able to connect to both PostgreSQL and Redis databases successfully!