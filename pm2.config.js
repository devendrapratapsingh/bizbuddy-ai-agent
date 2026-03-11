module.exports = {
  apps: [
    {
      name: 'bizbuddy',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      merge_logs: true
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/master',
      repo: 'git@github.com:your-org/bizbuddy-ai-agent.git',
      path: '/var/www/bizbuddy',

      'pre-setup': 'echo "Installing Node.js dependencies..."',
      'post-setup': 'echo "Setup completed"',

      'pre-deploy-local': 'echo "Deploying to production..."',

      'pre-deploy': 'echo "Installing dependencies..." && npm ci --only=production',
      'post-deploy': 'npm run build && pm2 reload ecosystem.config.js --env production',

      'post-deploy-local': 'echo "Deployment completed"'
    }
  }
};