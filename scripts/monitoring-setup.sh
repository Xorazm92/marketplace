#!/bin/bash
# Monitoring & Backup Setup Script for INBOLA Marketplace
# Production Monitoring Stack

set -e

echo "🚀 Starting monitoring and backup setup..."

# Configuration
PROJECT_NAME="inbola-marketplace"
DATADOG_API_KEY=${DATADOG_API_KEY:-"your_datadog_api_key"}
SENTRY_DSN=${SENTRY_DSN:-"your_sentry_dsn"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create monitoring directory
mkdir -p monitoring/{prometheus,grafana,elasticsearch,sentry}

# Install monitoring tools
print_status "Installing monitoring tools..."

# Install Docker if not exists
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
fi

# Install Docker Compose if not exists
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create Prometheus configuration
print_status "Creating Prometheus configuration..."
cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'inbola-app'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'inbola-api'
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/api/metrics'
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:5432']
    metrics_path: '/metrics'

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:6379']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
EOF

# Create Grafana configuration
print_status "Creating Grafana configuration..."
cat > monitoring/grafana/grafana.ini << 'EOF'
[server]
protocol = http
http_port = 3001
domain = grafana.inbola.uz

[security]
admin_user = admin
admin_password = your_secure_password_here

[database]
type = sqlite3
path = /var/lib/grafana/grafana.db

[users]
allow_sign_up = false
allow_org_create = false
EOF

# Create Grafana dashboards
print_status "Creating Grafana dashboards..."
mkdir -p monitoring/grafana/dashboards

# Application dashboard
cat > monitoring/grafana/dashboards/application-dashboard.json << 'EOF'
{
  "dashboard": {
    "title": "INBOLA Application Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
EOF

# Create Docker Compose for monitoring
print_status "Creating Docker Compose configuration..."
cat > monitoring/docker-compose.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    volumes:
      - ./grafana/grafana.ini:/etc/grafana/grafana.ini
      - ./grafana/dashboards:/var/lib/grafana/dashboards
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=your_secure_password_here

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  redis:
    image: redis:alpine
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  prometheus_data:
  grafana_data:
  elasticsearch_data:
  redis_data:
EOF

# Create backup scripts
print_status "Creating backup scripts..."

# Database backup
cat > monitoring/backup-database.sh << 'EOF'
#!/bin/bash
# Database Backup Script

BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="inbola_production"
S3_BUCKET="inbola-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U postgres $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://$S3_BUCKET/database/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
EOF

chmod +x monitoring/backup-database.sh

# Application backup
cat > monitoring/backup-application.sh << 'EOF'
#!/bin/bash
# Application Backup Script

BACKUP_DIR="/var/backups/application"
DATE=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="inbola-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/inbola/

# Upload to S3
aws s3 cp $BACKUP_DIR/app_backup_$DATE.tar.gz s3://$S3_BUCKET/application/

# Clean old backups (keep 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Application backup completed: app_backup_$DATE.tar.gz"
EOF

chmod +x monitoring/backup-application.sh

# Create monitoring scripts
print_status "Creating monitoring scripts..."

# Health check script
cat > monitoring/health-check.sh << 'EOF'
#!/bin/bash
# Health Check Script

echo "=== INBOLA Health Check ==="
echo "Date: $(date)"
echo ""

# Check application health
if curl -f -s -o /dev/null https://inbola.uz/health; then
    echo "✅ Main application is healthy"
else
    echo "❌ Main application is down"
fi

# Check API health
if curl -f -s -o /dev/null https://api.inbola.uz/health; then
    echo "✅ API is healthy"
else
    echo "❌ API is down"
fi

# Check database connection
if pg_isready -h localhost -p 5432 -U postgres; then
    echo "✅ Database is ready"
else
    echo "❌ Database is down"
fi

# Check Redis connection
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is down"
fi

echo ""
echo "=== System Resources ==="
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "Memory Usage: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "Disk Usage: $(df -h / | awk 'NR==2 {print $5}')"
EOF

chmod +x monitoring/health-check.sh

# Create crontab entries
print_status "Setting up crontab entries..."
cat > monitoring/crontab << 'EOF'
# INBOLA Monitoring Crontab

# Database backup daily at 2 AM
0 2 * * * /var/www/inbola/monitoring/backup-database.sh

# Application backup daily at 3 AM
0 3 * * * /var/www/inbola/monitoring/backup-application.sh

# Health check every 5 minutes
*/5 * * * * /var/www/inbola/monitoring/health-check.sh >> /var/log/inbola-health.log 2>&1

# SSL certificate renewal check daily at 4 AM
0 4 * * * /usr/bin/certbot renew --quiet --nginx
EOF

# Install Sentry CLI
print_status "Installing Sentry CLI..."
curl -sL https://sentry.io/get-cli/ | bash

# Create monitoring dashboard URLs
cat > monitoring/urls.txt << 'EOF'
=== INBOLA Monitoring URLs ===

Prometheus: http://localhost:9090
Grafana: http://localhost:3001 (admin/your_secure_password_here)
Elasticsearch: http://localhost:9200
Kibana: http://localhost:5601
Node Exporter: http://localhost:9100

Production URLs:
- Main Site: https://inbola.uz
- API: https://api.inbola.uz
- Admin: https://admin.inbola.uz
- CDN: https://cdn.inbola.uz
EOF

# Create startup script
cat > monitoring/start-monitoring.sh << 'EOF'
#!/bin/bash
# Start monitoring stack

echo "🚀 Starting monitoring stack..."
cd /var/www/inbola/monitoring
docker-compose up -d

echo "✅ Monitoring stack started!"
echo "📊 Access URLs:"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana: http://localhost:3001"
echo "   Elasticsearch: http://localhost:9200"
echo "   Kibana: http://localhost:5601"
EOF

chmod +x monitoring/start-monitoring.sh

# Create Uptime Robot configuration
cat > monitoring/uptime-robot-config.json << 'EOF'
{
  "monitors": [
    {
      "friendly_name": "INBOLA Main Site",
      "url": "https://inbola.uz",
      "type": 1,
      "sub_type": "",
      "keyword_type": "",
      "keyword_value": "",
      "http_username": "",
      "http_password": "",
      "port": "",
      "interval": 300
    },
    {
      "friendly_name": "INBOLA API",
      "url": "https://api.inbola.uz/health",
      "type": 1,
      "interval": 60
    },
    {
      "friendly_name": "INBOLA Admin",
      "url": "https://admin.inbola.uz",
      "type": 1,
      "interval": 300
    }
  ]
}
EOF

# Set permissions
chmod +x monitoring/*.sh

# Install crontab
print_status "Installing crontab..."
crontab monitoring/crontab

print_status "✅ Monitoring setup completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Start monitoring: ./monitoring/start-monitoring.sh"
echo "2. Access Grafana at http://localhost:3001"
echo "3. Configure alerts in monitoring/"
echo "4. Set up Uptime Robot monitoring"
echo "5. Configure backup schedules"
echo ""
echo "🔧 Useful commands:"
echo "   Start monitoring: docker-compose -f monitoring/docker-compose.yml up -d"
echo "   View logs: docker-compose -f monitoring/docker-compose.yml logs -f"
echo "   Stop monitoring: docker-compose -f monitoring/docker-compose.yml down"
