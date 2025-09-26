// Production Monitoring & Backup Configuration
// Uzbekistan Marketplace - INBOLA

export const monitoring = {
  // Application Performance Monitoring
  apm: {
    provider: 'datadog',
    apiKey: process.env.DATADOG_API_KEY || 'YOUR_DATADOG_API_KEY',
    appKey: process.env.DATADOG_APP_KEY || 'YOUR_DATADOG_APP_KEY',
    
    metrics: {
      requests: true,
      responseTime: true,
      errorRate: true,
      throughput: true,
      database: true,
      externalServices: true
    },
    
    alerts: {
      errorRate: 5, // percentage
      responseTime: 2000, // ms
      throughput: 100, // requests per minute
      databaseConnections: 80, // percentage
      memoryUsage: 85, // percentage
      cpuUsage: 80 // percentage
    }
  },

  // Infrastructure Monitoring
  infrastructure: {
    provider: 'prometheus',
    grafana: {
      url: 'https://grafana.inbola.uz',
      username: process.env.GRAFANA_USERNAME || 'admin',
      password: process.env.GRAFANA_PASSWORD || 'admin'
    },
    
    metrics: {
      cpu: true,
      memory: true,
      disk: true,
      network: true,
      loadAverage: true,
      process: true
    },
    
    dashboards: {
      overview: 'marketplace-overview',
      api: 'api-performance',
      database: 'database-metrics',
      payment: 'payment-processing',
      user: 'user-activity'
    }
  },

  // Log Management
  logging: {
    provider: 'elasticsearch',
    elasticsearch: {
      url: process.env.ELASTICSEARCH_URL || 'https://elasticsearch.inbola.uz',
      username: process.env.ELASTIC_USERNAME || 'elastic',
      password: process.env.ELASTIC_PASSWORD || 'elastic'
    },
    
    retention: {
      error: 90, // days
      warning: 30, // days
      info: 7, // days
      debug: 1 // day
    },
    
    indices: {
      application: 'inbola-app-logs',
      access: 'inbola-access-logs',
      error: 'inbola-error-logs',
      audit: 'inbola-audit-logs'
    }
  },

  // Error Tracking
  errorTracking: {
    provider: 'sentry',
    dsn: process.env.SENTRY_DSN || 'YOUR_SENTRY_DSN',
    environment: process.env.NODE_ENV || 'production',
    
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    
    integrations: [
      'http',
      'express',
      'prisma',
      'redis',
      'cloudinary'
    ]
  },

  // Uptime Monitoring
  uptime: {
    provider: 'uptimerobot',
    apiKey: process.env.UPTIMEROBOT_API_KEY || 'YOUR_UPTIMEROBOT_API_KEY',
    
    monitors: [
      {
        name: 'Main Website',
        url: 'https://inbola.uz',
        interval: 300 // seconds
      },
      {
        name: 'API',
        url: 'https://api.inbola.uz/health',
        interval: 60 // seconds
      },
      {
        name: 'Payment Gateway',
        url: 'https://api.inbola.uz/payment/health',
        interval: 300 // seconds
      },
      {
        name: 'CDN',
        url: 'https://cdn.inbola.uz/health',
        interval: 300 // seconds
      }
    ],
    
    alerts: {
      email: ['admin@inbola.uz', 'dev@inbola.uz'],
      sms: ['+998901234567'],
      webhook: 'https://api.inbola.uz/webhooks/uptime'
    }
  }
};

// Backup Configuration
export const backup = {
  // Database Backup
  database: {
    provider: 'aws-backup',
    schedule: {
      full: '0 2 * * 0', // Weekly on Sunday 2 AM
      incremental: '0 2 * * *', // Daily 2 AM
      retention: {
        daily: 7,
        weekly: 4,
        monthly: 12,
        yearly: 10
      }
    },
    
    destinations: [
      {
        type: 's3',
        bucket: 'inbola-backups',
        region: 'us-east-1',
        encryption: 'AES256'
      },
      {
        type: 'glacier',
        vault: 'inbola-archive',
        region: 'us-east-1',
        encryption: 'AES256'
      }
    ]
  },

  // File Storage Backup
  files: {
    provider: 'aws-backup',
    schedule: {
      daily: '0 1 * * *', // Daily 1 AM
      weekly: '0 1 * * 0', // Weekly on Sunday 1 AM
      retention: {
        daily: 30,
        weekly: 8,
        monthly: 12
      }
    },
    
    sources: [
      {
        type: 's3',
        bucket: 'inbola-uploads',
        prefix: 'products/'
      },
      {
        type: 's3',
        bucket: 'inbola-uploads',
        prefix: 'avatars/'
      },
      {
        type: 's3',
        bucket: 'inbola-uploads',
        prefix: 'kyc/'
      }
    ]
  },

  // Application Backup
  application: {
    provider: 'rsync',
    schedule: {
      daily: '0 3 * * *', // Daily 3 AM
      retention: {
        daily: 7,
        weekly: 4,
        monthly: 12
      }
    },
    
    sources: [
      '/var/www/inbola',
      '/etc/nginx/sites-available',
      '/etc/systemd/system'
    ],
    
    destinations: [
      {
        type: 's3',
        bucket: 'inbola-app-backups',
        region: 'us-east-1'
      }
    ]
  }
};

// Disaster Recovery
export const disasterRecovery = {
  rpo: 3600, // Recovery Point Objective: 1 hour
  rto: 1800, // Recovery Time Objective: 30 minutes
  
  procedures: {
    database: {
      primary: 'us-east-1',
      replica: 'us-west-2',
      failover: 'automatic',
      backupVerification: 'daily'
    },
    
    application: {
      loadBalancer: 'multi-region',
      healthChecks: 'every-30-seconds',
      autoScaling: true,
      circuitBreaker: true
    },
    
    storage: {
      replication: 'cross-region',
      versioning: true,
      lifecycle: 'intelligent-tiering'
    }
  },
  
  testing: {
    schedule: 'monthly',
    scenarios: ['database-failure', 'server-failure', 'network-failure'],
    validation: 'automated'
  }
};

// Security Monitoring
export const securityMonitoring = {
  intrusionDetection: {
    provider: 'ossec',
    rules: {
      sqlInjection: true,
      xss: true,
      bruteforce: true,
      ddos: true
    },
    
    alerts: {
      email: ['security@inbola.uz'],
      sms: ['+998901234567'],
      webhook: 'https://api.inbola.uz/webhooks/security'
    }
  },
  
  vulnerabilityScanning: {
    provider: 'nessus',
    schedule: 'weekly',
    scope: ['web', 'api', 'database', 'infrastructure'],
    
    severity: {
      critical: 'immediate',
      high: '24h',
      medium: '7d',
      low: '30d'
    }
  },
  
  compliance: {
    standards: ['OWASP', 'PCI-DSS', 'ISO-27001'],
    audits: {
      schedule: 'quarterly',
      external: true,
      internal: 'monthly'
    }
  }
};

// Production Environment Variables
export const monitoringEnvTemplate = `
# Monitoring
DATADOG_API_KEY=your_datadog_api_key
DATADOG_APP_KEY=your_datadog_app_key

# Elasticsearch
ELASTICSEARCH_URL=https://elasticsearch.inbola.uz
ELASTIC_USERNAME=elastic
ELASTIC_PASSWORD=your_elastic_password

# Grafana
GRAFANA_URL=https://grafana.inbola.uz
GRAFANA_USERNAME=admin
GRAFANA_PASSWORD=your_grafana_password

# Sentry
SENTRY_DSN=your_sentry_dsn

# Uptime Monitoring
UPTIMEROBOT_API_KEY=your_uptimerobot_api_key

# Backup
AWS_BACKUP_REGION=us-east-1
BACKUP_S3_BUCKET=inbola-backups
BACKUP_RETENTION_DAYS=30

# Security
OSSEC_SERVER=your_ossec_server
NESSUS_API_KEY=your_nessus_api_key
`;

// Backup Scripts
export const backupScripts = {
  database: `#!/bin/bash
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

# Verify backup
aws s3 ls s3://$S3_BUCKET/database/ | tail -5
`,

  files: `#!/bin/bash
# File Backup Script
BACKUP_DIR="/var/backups/files"
DATE=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="inbola-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Sync files to S3
aws s3 sync /var/www/inbola/uploads s3://$S3_BUCKET/files/uploads/ --delete

# Create archive
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/inbola/uploads

# Upload archive
aws s3 cp $BACKUP_DIR/files_backup_$DATE.tar.gz s3://$S3_BUCKET/files/

# Clean old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
`
};

// Monitoring Dashboard URLs
export const monitoringUrls = {
  datadog: 'https://app.datadoghq.com/dashboard/inbola-marketplace',
  grafana: 'https://grafana.inbola.uz/d/marketplace-overview',
  sentry: 'https://sentry.io/organizations/inbola/projects/marketplace/',
  elasticsearch: 'https://elasticsearch.inbola.uz/app/kibana#/dashboard/marketplace-logs'
};
