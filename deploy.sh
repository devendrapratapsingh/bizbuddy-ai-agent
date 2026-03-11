#!/bin/bash

# BizBuddy AI Agent - Production Deployment Script

set -e

echo "🚀 Deploying BizBuddy AI Agent to production..."

# Check if we're in the right directory
if [ ! -f package.json ]; then
    echo "❌ package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &&; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if pm2 is installed
if ! command -v pm2 &&; then
    echo "⚠️  pm2 is not installed. Installing pm2..."
    npm install -g pm2
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create .env file first."
    exit 1
fi

# Check for required environment variables
if ! grep -q "NODE_ENV=" .env; then
    echo "❌ NODE_ENV is not set in .env file"
    exit 1
fi

if ! grep -q "DATABASE_URL=" .env; then
    echo "❌ DATABASE_URL is not set in .env file"
    exit 1
fi

if ! grep -q "JWT_SECRET=" .env; then
    echo "❌ JWT_SECRET is not set in .env file"
    exit 1
fi

if ! grep -q "OPENAI_API_KEY=" .env; then
    echo "❌ OPENAI_API_KEY is not set in .env file"
    exit 1
fi

# Install dependencies
echo "📦 Installing production dependencies..."
npm ci --only=production

# Build the application
echo "🏗️  Building the application..."
npm run build

# Setup database (optional)
echo "🗄️  Setting up database..."
npx prisma migrate deploy
npx prisma generate

echo "✅ Database setup completed"

# Start the application with pm2
echo "🚀 Starting the application..."
pm2 start pm2.config.js --env production

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Check application logs: pm2 logs bizbuddy"
echo "2. Monitor application: pm2 monit"
echo "3. Restart if needed: pm2 restart bizbuddy"
echo ""
echo "🌐 Application should be running on port 3000"
echo ""
echo "📊 For monitoring and management:"
echo "   pm2 list          # List all processes"
echo "   pm2 logs bizbuddy # Show logs for bizbuddy"
echo "   pm2 restart bizbuddy # Restart application"
echo "   pm2 stop bizbuddy   # Stop application"
echo "   pm2 delete bizbuddy # Remove from pm2"
echo ""
echo "🔒 For security:"
echo "   Make sure to setup SSL/TLS with a reverse proxy like Nginx or Apache"
echo "   Configure firewall to only allow necessary ports"
echo "   Keep Node.js and dependencies updated"
echo ""
echo "🎉 BizBuddy AI Agent is now running in production!"