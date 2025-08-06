#!/bin/bash

# INBOLA Monitoring and Logging Setup Script
# Bu script production monitoring va logging ni sozlaydi

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_step() {
    echo -e "${YELLOW}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header "📊 INBOLA Monitoring & Logging Setup"

# Create monitoring directories
setup_directories() {
    print_step "Monitoring papkalarini yaratish..."
    
    mkdir -p logs
    mkdir -p monitoring
    mkdir -p monitoring/grafana
    mkdir -p monitoring/prometheus
    mkdir -p monitoring/alertmanager
    
    print_success "Monitoring papkalari yaratildi"
}

# Setup log rotation
setup_log_rotation() {
    print_step "Log rotation sozlash..."
    
    cat > logs/logrotate.conf << 'EOF'
# INBOLA Log Rotation Configuration

logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        # Restart services if needed
        docker-compose -f docker-compose.prod.yml restart backend frontend || true
    endscript
}

logs/access.log {
    daily
    missingok
    rotate 90
    compress
    delaycompress
    notifempty
    create 644 root root
}

logs/error.log {
    daily
    missingok
    rotate 90
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

    print_success "Log rotation sozlandi"
}

# Setup health check script
setup_health_checks() {
    print_step "Health check scriptini yaratish..."
    
    cat > monitoring/health-check.sh << 'EOF'
#!/bin/bash

# INBOLA Health Check Script
# Bu script barcha servicelarni tekshiradi

LOG_FILE="logs/health-check.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

log_message() {
    echo "[$DATE] $1" >> "$LOG_FILE"
    echo "$1"
}

# Check backend health
check_backend() {
    if curl -f -s http://localhost:3001/health > /dev/null; then
        log_message "✅ Backend: OK"
        return 0
    else
        log_message "❌ Backend: FAILED"
        return 1
    fi
}

# Check frontend health
check_frontend() {
    if curl -f -s http://localhost:3000 > /dev/null; then
        log_message "✅ Frontend: OK"
        return 0
    else
        log_message "❌ Frontend: FAILED"
        return 1
    fi
}

# Check database health
check_database() {
    if docker exec inbola_postgres pg_isready -U inbola_user -d inbola_db > /dev/null 2>&1; then
        log_message "✅ Database: OK"
        return 0
    else
        log_message "❌ Database: FAILED"
        return 1
    fi
}

# Check redis health
check_redis() {
    if docker exec inbola_redis redis-cli ping > /dev/null 2>&1; then
        log_message "✅ Redis: OK"
        return 0
    else
        log_message "❌ Redis: FAILED"
        return 1
    fi
}

# Check disk space
check_disk_space() {
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -lt 80 ]; then
        log_message "✅ Disk Space: ${DISK_USAGE}% used"
        return 0
    else
        log_message "⚠️ Disk Space: ${DISK_USAGE}% used (WARNING)"
        return 1
    fi
}

# Check memory usage
check_memory() {
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ "$MEMORY_USAGE" -lt 80 ]; then
        log_message "✅ Memory: ${MEMORY_USAGE}% used"
        return 0
    else
        log_message "⚠️ Memory: ${MEMORY_USAGE}% used (WARNING)"
        return 1
    fi
}

# Main health check
main() {
    log_message "🏥 Starting health check..."
    
    FAILED=0
    
    check_backend || FAILED=$((FAILED + 1))
    check_frontend || FAILED=$((FAILED + 1))
    check_database || FAILED=$((FAILED + 1))
    check_redis || FAILED=$((FAILED + 1))
    check_disk_space || FAILED=$((FAILED + 1))
    check_memory || FAILED=$((FAILED + 1))
    
    if [ $FAILED -eq 0 ]; then
        log_message "🎉 All systems healthy!"
        exit 0
    else
        log_message "🚨 $FAILED checks failed!"
        exit 1
    fi
}

main "$@"
EOF

    chmod +x monitoring/health-check.sh
    print_success "Health check scripti yaratildi"
}

# Setup monitoring dashboard
setup_monitoring_dashboard() {
    print_step "Monitoring dashboard yaratish..."
    
    cat > monitoring/dashboard.html << 'EOF'
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INBOLA Monitoring Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .status-ok { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-error { color: #dc3545; }
        .metric {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .refresh-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px 0;
        }
        .refresh-btn:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 INBOLA Monitoring Dashboard</h1>
            <p>Real-time system monitoring</p>
        </div>
        
        <button class="refresh-btn" onclick="refreshData()">🔄 Refresh Data</button>
        
        <div class="grid">
            <div class="card">
                <h3>🏥 System Health</h3>
                <div id="health-status">Loading...</div>
            </div>
            
            <div class="card">
                <h3>📊 Performance Metrics</h3>
                <div id="performance-metrics">Loading...</div>
            </div>
            
            <div class="card">
                <h3>🔗 Service Status</h3>
                <div id="service-status">Loading...</div>
            </div>
            
            <div class="card">
                <h3>📈 Recent Activity</h3>
                <div id="recent-activity">Loading...</div>
            </div>
        </div>
    </div>

    <script>
        async function checkHealth() {
            try {
                const response = await fetch('/api/v1/health');
                const data = await response.json();
                return data;
            } catch (error) {
                return { status: 'ERROR', message: error.message };
            }
        }

        async function refreshData() {
            document.getElementById('health-status').innerHTML = 'Loading...';
            
            const health = await checkHealth();
            
            let healthHtml = '';
            if (health.status === 'OK') {
                healthHtml = '<div class="status-ok">✅ All systems operational</div>';
            } else {
                healthHtml = '<div class="status-error">❌ System issues detected</div>';
            }
            
            document.getElementById('health-status').innerHTML = healthHtml;
            
            // Update other sections
            document.getElementById('performance-metrics').innerHTML = `
                <div class="metric">
                    <span>Uptime:</span>
                    <span>${health.uptime || 'N/A'} seconds</span>
                </div>
                <div class="metric">
                    <span>Memory:</span>
                    <span>${health.memory?.used || 'N/A'}</span>
                </div>
                <div class="metric">
                    <span>Environment:</span>
                    <span>${health.environment || 'N/A'}</span>
                </div>
            `;
            
            document.getElementById('service-status').innerHTML = `
                <div class="metric">
                    <span>API:</span>
                    <span class="status-ok">${health.services?.api || 'Unknown'}</span>
                </div>
                <div class="metric">
                    <span>Database:</span>
                    <span class="status-ok">${health.database || 'Unknown'}</span>
                </div>
                <div class="metric">
                    <span>Auth:</span>
                    <span class="status-ok">${health.services?.auth || 'Unknown'}</span>
                </div>
            `;
            
            document.getElementById('recent-activity').innerHTML = `
                <div class="metric">
                    <span>Last Check:</span>
                    <span>${new Date().toLocaleString()}</span>
                </div>
                <div class="metric">
                    <span>Version:</span>
                    <span>${health.version || '1.0.0'}</span>
                </div>
            `;
        }

        // Auto refresh every 30 seconds
        setInterval(refreshData, 30000);
        
        // Initial load
        refreshData();
    </script>
</body>
</html>
EOF

    print_success "Monitoring dashboard yaratildi"
}

# Setup alerting script
setup_alerting() {
    print_step "Alert tizimini sozlash..."
    
    cat > monitoring/alert.sh << 'EOF'
#!/bin/bash

# INBOLA Alert System
# Bu script muammolar haqida ogohlantiradi

WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
TELEGRAM_CHAT_ID="YOUR_TELEGRAM_CHAT_ID"

send_slack_alert() {
    local message="$1"
    local color="$2"
    
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚨 INBOLA Alert\", \"attachments\":[{\"color\":\"$color\",\"text\":\"$message\"}]}" \
        "$WEBHOOK_URL"
}

send_telegram_alert() {
    local message="$1"
    
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d chat_id="$TELEGRAM_CHAT_ID" \
        -d text="🚨 INBOLA Alert: $message"
}

send_email_alert() {
    local subject="$1"
    local message="$2"
    
    echo "$message" | mail -s "$subject" admin@inbola.uz
}

# Main alert function
send_alert() {
    local level="$1"
    local message="$2"
    
    case $level in
        "critical")
            send_slack_alert "$message" "danger"
            send_telegram_alert "$message"
            send_email_alert "CRITICAL: INBOLA System Alert" "$message"
            ;;
        "warning")
            send_slack_alert "$message" "warning"
            ;;
        "info")
            send_slack_alert "$message" "good"
            ;;
    esac
}

# Export function for use in other scripts
export -f send_alert
EOF

    chmod +x monitoring/alert.sh
    print_success "Alert tizimi sozlandi"
}

# Setup cron jobs
setup_cron_jobs() {
    print_step "Cron jobs sozlash..."
    
    cat > monitoring/crontab.txt << 'EOF'
# INBOLA Monitoring Cron Jobs

# Health check every 5 minutes
*/5 * * * * /path/to/marketplace/monitoring/health-check.sh

# Database backup daily at 2 AM
0 2 * * * /path/to/marketplace/backup-database.sh

# Log rotation daily at 3 AM
0 3 * * * /usr/sbin/logrotate /path/to/marketplace/logs/logrotate.conf

# Cleanup old logs weekly
0 4 * * 0 find /path/to/marketplace/logs -name "*.log.*" -mtime +30 -delete

# System resource check every hour
0 * * * * /path/to/marketplace/monitoring/resource-check.sh
EOF

    print_success "Cron jobs konfiguratsiyasi yaratildi"
    print_warning "Cron jobs ni qo'lda o'rnatish kerak: crontab monitoring/crontab.txt"
}

# Main setup function
main() {
    print_step "Monitoring setup boshlandi..."
    
    setup_directories
    setup_log_rotation
    setup_health_checks
    setup_monitoring_dashboard
    setup_alerting
    setup_cron_jobs
    
    print_header "🎉 Monitoring Setup tugallandi!"
    
    echo -e "${GREEN}"
    echo "✅ Monitoring va logging tizimi sozlandi!"
    echo ""
    echo "📁 Yaratilgan fayllar:"
    echo "   - monitoring/health-check.sh"
    echo "   - monitoring/dashboard.html"
    echo "   - monitoring/alert.sh"
    echo "   - logs/logrotate.conf"
    echo "   - monitoring/crontab.txt"
    echo ""
    echo "🔄 Keyingi qadamlar:"
    echo "   1. Cron jobs ni o'rnating: crontab monitoring/crontab.txt"
    echo "   2. Alert webhook URLs ni yangilang"
    echo "   3. Health check ni test qiling: ./monitoring/health-check.sh"
    echo "   4. Dashboard ni brauzerda oching: monitoring/dashboard.html"
    echo -e "${NC}"
}

main "$@"
