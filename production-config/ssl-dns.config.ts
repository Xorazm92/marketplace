// Production SSL/TLS and DNS Configuration
// Uzbekistan Marketplace - INBOLA

export const sslConfig = {
  // SSL Certificate Configuration
  certificates: {
    primary: {
      domain: 'inbola.uz',
      subdomains: [
        'www.inbola.uz',
        'api.inbola.uz',
        'cdn.inbola.uz',
        'admin.inbola.uz',
        'm.inbola.uz'
      ],
      provider: 'Let's Encrypt',
      type: 'RSA',
      keySize: 4096,
      autoRenew: true,
      renewDays: 30,
      validation: 'DNS-01'
    },
    
    wildcard: {
      domain: '*.inbola.uz',
      provider: 'Let's Encrypt',
      type: 'RSA',
      keySize: 4096,
      autoRenew: true,
      renewDays: 30
    }
  },

  // TLS Configuration
  tls: {
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3',
    ciphers: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES128-GCM-SHA256'
    ],
    protocols: ['http/1.1', 'h2', 'h3'],
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    }
  },

  // DNS Configuration
  dns: {
    provider: 'Cloudflare',
    zones: {
      primary: {
        domain: 'inbola.uz',
        type: 'A',
        ttl: 300,
        proxied: true,
        records: [
          { name: '@', value: 'YOUR_SERVER_IP', type: 'A' },
          { name: 'www', value: 'YOUR_SERVER_IP', type: 'A' },
          { name: 'api', value: 'YOUR_SERVER_IP', type: 'A' },
          { name: 'cdn', value: 'YOUR_CDN_IP', type: 'A' },
          { name: 'admin', value: 'YOUR_SERVER_IP', type: 'A' }
        ]
      },
      
      cdn: {
        domain: 'cdn.inbola.uz',
        type: 'CNAME',
        ttl: 300,
        proxied: true,
        value: 'YOUR_CLOUDFRONT_DOMAIN.cloudfront.net'
      }
    },
    
    security: {
      dnssec: true,
      ddosProtection: true,
      rateLimiting: {
        requests: 100,
        window: 60 // seconds
      },
      firewall: {
        enabled: true,
        rules: [
          'block known bad IPs',
          'rate limit suspicious traffic',
          'allow known good bots'
        ]
      }
    }
  },

  // SSL Certificate Management Script
  sslManagement: {
    acme: {
      email: 'admin@inbola.uz',
      staging: false,
      challenge: 'dns-01',
      dnsProvider: 'cloudflare'
    },
    
    renewal: {
      cron: '0 0 * * *', // Daily at midnight
      preHook: 'systemctl stop nginx',
      postHook: 'systemctl start nginx',
      deployHook: 'systemctl reload nginx'
    },
    
    monitoring: {
      checkInterval: 3600, // 1 hour
      alertBefore: 7, // days
      webhooks: [
        'https://api.inbola.uz/webhooks/ssl/expiry',
        'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
      ]
    }
  }
};

// Nginx Configuration
export const nginxConfig = `
# Production Nginx Configuration for inbola.uz
server {
    listen 80;
    server_name inbola.uz www.inbola.uz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name inbola.uz www.inbola.uz;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/inbola.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/inbola.uz/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Static Files
    location /static/ {
        alias /var/www/inbola/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Images
    location /uploads/ {
        alias /var/www/inbola/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API subdomain
server {
    listen 443 ssl http2;
    server_name api.inbola.uz;

    ssl_certificate /etc/letsencrypt/live/api.inbola.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.inbola.uz/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# CDN subdomain
server {
    listen 443 ssl http2;
    server_name cdn.inbola.uz;

    ssl_certificate /etc/letsencrypt/live/cdn.inbola.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cdn.inbola.uz/privkey.pem;

    location / {
        proxy_pass https://your-cloudfront-domain.cloudfront.net;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;

// SSL Certificate Generation Script
export const sslScript = `#!/bin/bash
# SSL Certificate Generation Script for inbola.uz

DOMAIN="inbola.uz"
EMAIL="admin@inbola.uz"

# Install certbot if not exists
if ! command -v certbot &> /dev/null; then
    sudo apt update
    sudo apt install certbot python3-certbot-nginx -y
fi

# Generate SSL certificate
sudo certbot certonly --nginx \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d api.$DOMAIN \
    -d cdn.$DOMAIN \
    -d admin.$DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive \
    --staging=false

# Auto-renewal setup
sudo crontab -l 2>/dev/null | { cat; echo "0 0 * * * /usr/bin/certbot renew --quiet --nginx"; } | sudo crontab -

# Test renewal
sudo certbot renew --dry-run

echo "SSL certificates generated successfully for $DOMAIN"
`;

// DNS Records Template
export const dnsRecords = [
  { type: 'A', name: '@', value: 'YOUR_SERVER_IP', ttl: 300 },
  { type: 'A', name: 'www', value: 'YOUR_SERVER_IP', ttl: 300 },
  { type: 'A', name: 'api', value: 'YOUR_SERVER_IP', ttl: 300 },
  { type: 'A', name: 'admin', value: 'YOUR_SERVER_IP', ttl: 300 },
  { type: 'CNAME', name: 'cdn', value: 'YOUR_CLOUDFRONT_DOMAIN.cloudfront.net', ttl: 300 },
  { type: 'CNAME', name: 'static', value: 'YOUR_S3_BUCKET.s3.amazonaws.com', ttl: 300 },
  { type: 'MX', name: '@', value: 'smtp.gmail.com', priority: 1, ttl: 3600 },
  { type: 'TXT', name: '@', value: 'v=spf1 include:_spf.google.com ~all', ttl: 3600 },
  { type: 'TXT', name: '@', value: 'google-site-verification=YOUR_VERIFICATION_CODE', ttl: 3600 }
];

// Environment Variables Template
export const sslEnvTemplate = `
# SSL/TLS Configuration
SSL_CERT_PATH=/etc/letsencrypt/live/inbola.uz/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/inbola.uz/privkey.pem
SSL_PROTOCOLS=TLSv1.2,TLSv1.3
SSL_CIPHERS=ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256

# Domain Configuration
DOMAIN=inbola.uz
WWW_DOMAIN=www.inbola.uz
API_DOMAIN=api.inbola.uz
CDN_DOMAIN=cdn.inbola.uz
ADMIN_DOMAIN=admin.inbola.uz

# DNS Configuration
DNS_PROVIDER=cloudflare
DNS_API_TOKEN=your_cloudflare_api_token
DNS_ZONE_ID=your_zone_id

# SSL Renewal
SSL_RENEW_EMAIL=admin@inbola.uz
SSL_RENEW_DAYS=30
`;

// Monitoring Configuration
export const sslMonitoring = {
  uptime: {
    target: 99.9,
    checkInterval: 60, // seconds
    timeout: 10 // seconds
  },
  
  certificate: {
    expiryAlert: 30, // days before expiry
    checkInterval: 3600 // seconds
  },
  
  performance: {
    ttfb: 200, // ms
    sslHandshake: 500, // ms
    totalTime: 1000 // ms
  }
};
