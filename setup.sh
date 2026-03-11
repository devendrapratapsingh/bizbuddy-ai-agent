#!/bin/bash

# BizBuddy AI Agent - Setup Script

set -e

echo "🚀 Setting up BizBuddy AI Agent..."

# Check if Node.js is installed
if ! command -v node &&; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
MIN_VERSION="18.0.0"
if [ "$(printf '%s\n' "$NODE_VERSION" "$MIN_VERSION" | sort -V | head -n1)" = "$MIN_VERSION" ]; then
    echo "✅ Node.js version $NODE_VERSION is compatible"
else
    echo "❌ Node.js version $NODE_VERSION is too old. Please update to at least $MIN_VERSION"
    exit 1
fi

# Check if npm or yarn is installed
if command -v npm; then
    PACKAGE_MANAGER="npm"
elif command -v yarn; then
    PACKAGE_MANAGER="yarn"
else
    echo "❌ Neither npm nor yarn is installed. Please install one of them."
    exit 1
fi

echo "📦 Installing dependencies using $PACKAGE_MANAGER..."
if [ "$PACKAGE_MANAGER" = "npm" ]; then
    npm install
else
    yarn install
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
        echo "⚠️  Please edit .env file with your configuration before running the application"
    else
        echo "❌ .env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Check for required environment variables
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

# Setup database
if command -v npx &&; then
    echo "🗄️  Setting up database..."
    npx prisma migrate dev --name init --create-only
    npx prisma db push
    echo "✅ Database setup completed"
else
    echo "⚠️  npx not available. Please run 'npx prisma migrate dev' manually to setup database."
fi

# Build the application
echo "🏗️  Building the application..."
if [ "$PACKAGE_MANAGER" = "npm" ]; then
    npm run build
else
    yarn build
fi

echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit the .env file with your configuration"
echo "2. Run 'npm run dev' or 'yarn dev' to start the development server"
echo "3. Visit http://localhost:3000 to access the application"
echo ""
echo "🔑 Important: Make sure to set up your OpenAI API key and database URL in the .env file"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev   # or   yarn dev"
echo ""
echo "📊 For production deployment:"
echo "   npm run build # or   yarn build"
echo "   npm start     # or   yarn start"
echo ""
echo "📚 Documentation: https://github.com/your-org/bizbuddy-ai-agent"
echo ""
echo "🎉 BizBuddy AI Agent is ready to use!"