
const fs = require('fs');
const path = require('path');

// Grafana dashboard configuration
const grafanaDashboard = {
  "dashboard": {
    "id": null,
    "title": "INBOLA Kids E-Commerce Platform",
    "tags": ["nodejs", "nestjs", "ecommerce"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_ms",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ],
        "yAxes": [
          {
            "label": "Response Time (ms)",
            "min": 0
          }
        ]
      },
      {
        "id": 2,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"4..|5..\"}[5m])",
            "legendFormat": "Error Rate"
          }
        ],
        "thresholds": "0.01,0.05"
      },
      {
        "id": 4,
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "database_connections_active",
            "legendFormat": "Active Connections"
          }
        ]
      },
      {
        "id": 5,
        "title": "Redis Operations",
        "type": "graph",
        "targets": [
          {
            "expr": "redis_operations_total",
            "legendFormat": "{{operation}}"
          }
        ]
      },
      {
        "id": 6,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "process_resident_memory_bytes",
            "legendFormat": "Memory Usage"
          }
        ]
      },
      {
        "id": 7,
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(process_cpu_seconds_total[5m])",
            "legendFormat": "CPU Usage"
          }
        ]
      },
      {
        "id": 8,
        "title": "Top Endpoints by Traffic",
        "type": "table",
        "targets": [
          {
            "expr": "topk(10, sum by (endpoint) (rate(http_requests_total[5m])))",
            "format": "table"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
};

// Prometheus configuration
const prometheusConfig = `
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'inbola-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'inbola-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
`;

// Alert rules
const alertRules = `
groups:
  - name: inbola-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 10% for more than 2 minutes"

      - alert: HighResponseTime
        expr: http_request_duration_ms > 2000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "Response time is above 2000ms for more than 5 minutes"

      - alert: DatabaseConnectionsHigh
        expr: database_connections_active > 80
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "Database connections are above 80 for more than 2 minutes"

      - alert: MemoryUsageHigh
        expr: process_resident_memory_bytes > 1073741824
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 1GB for more than 5 minutes"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "Service {{ $labels.instance }} is down"
`;

// Docker Compose for monitoring stack
const monitoringDockerCompose = `
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/rules:/etc/prometheus/rules
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
      - '--web.enable-admin-api'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-storage:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: redis-exporter
    ports:
      - "9121:9121"
    environment:
      - REDIS_ADDR=redis://redis:6379

  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: postgres-exporter
    ports:
      - "9187:9187"
    environment:
      - DATA_SOURCE_NAME=postgresql://username:password@postgres:5432/inbola_kids?sslmode=disable

volumes:
  grafana-storage:
`;

// Create monitoring files
function createMonitoringFiles() {
  const monitoringDir = path.join(__dirname, '../monitoring');
  
  // Create directories
  if (!fs.existsSync(monitoringDir)) {
    fs.mkdirSync(monitoringDir, { recursive: true });
  }
  
  fs.mkdirSync(path.join(monitoringDir, 'rules'), { recursive: true });
  fs.mkdirSync(path.join(monitoringDir, 'grafana/dashboards'), { recursive: true });
  fs.mkdirSync(path.join(monitoringDir, 'grafana/datasources'), { recursive: true });

  // Write configuration files
  fs.writeFileSync(
    path.join(monitoringDir, 'prometheus.yml'),
    prometheusConfig
  );

  fs.writeFileSync(
    path.join(monitoringDir, 'rules/alerts.yml'),
    alertRules
  );

  fs.writeFileSync(
    path.join(monitoringDir, 'grafana/dashboards/inbola-dashboard.json'),
    JSON.stringify(grafanaDashboard, null, 2)
  );

  fs.writeFileSync(
    path.join(__dirname, '../docker-compose.monitoring.yml'),
    monitoringDockerCompose
  );

  console.log('✅ Monitoring configuration files created successfully!');
  console.log('📁 Files created:');
  console.log('  - monitoring/prometheus.yml');
  console.log('  - monitoring/rules/alerts.yml');
  console.log('  - monitoring/grafana/dashboards/inbola-dashboard.json');
  console.log('  - docker-compose.monitoring.yml');
  console.log('\n🚀 To start monitoring stack:');
  console.log('  docker-compose -f docker-compose.monitoring.yml up -d');
  console.log('\n🌐 Access URLs:');
  console.log('  - Grafana: http://localhost:3001 (admin/admin123)');
  console.log('  - Prometheus: http://localhost:9090');
  console.log('  - Alertmanager: http://localhost:9093');
}

createMonitoringFiles();
