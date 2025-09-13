
module.exports = {
  apps: [
    {
      name: 'inbola-backend',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Monitoring
      monitoring: false,
      pmx: false,
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      
      // Memory and CPU limits
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Restart policy
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Auto restart on file changes (disable in production)
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      
      // Source maps support
      source_map_support: true,
      
      // Environment variables file
      env_file: '.env.production',
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Cron restart (daily at 3 AM)
      cron_restart: '0 3 * * *',
      
      // Advanced options
      merge_logs: true,
      autorestart: true,
      
      // Post-deploy hooks
      post_update: ['npm install', 'npx prisma generate', 'npm run build'],
    }
  ],

  deploy: {
    production: {
      user: 'deployer',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/inbola-backend.git',
      path: '/var/www/inbola-backend',
      'post-deploy': 'npm install && npx prisma generate && npx prisma migrate deploy && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/inbola-backend/logs'
    }
  }
};
