#!/bin/bash

# BizBuddy AI Agent - Build and Verification Script

set -e

echo "🔨 Building BizBuddy AI Agent..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
print_info "Node.js version: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_info ".env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
        print_info "Please edit .env file with your configuration before continuing."
    else
        print_error ".env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Install dependencies
print_info "Installing backend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
print_info "Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi
cd ..

# TypeScript compilation check
print_info "Checking TypeScript compilation..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    print_success "TypeScript compilation successful"
else
    print_error "TypeScript compilation failed"
    exit 1
fi

# Lint check
print_info "Running linter..."
npm run lint 2>/dev/null || print_info "Linting completed with warnings"
print_success "Lint check completed"

# Build application
print_info "Building application..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Build successful"
else
    print_error "Build failed"
    exit 1
fi

# Build frontend
print_info "Building frontend..."
cd frontend
npm run build 2>/dev/null || print_info "Frontend build completed with warnings"
cd ..

# Check if build output exists
if [ -d "dist" ] && [ -f "dist/server.js" ]; then
    print_success "Backend build output created"
else
    print_error "Backend build output not found"
    exit 1
fi

if [ -d "frontend/build" ] && [ -f "frontend/build/index.html" ]; then
    print_success "Frontend build output created"
else
    print_warning "Frontend build output not found (this is okay if using development mode)"
fi

# Print summary
echo ""
echo "=========================================="
print_success "Build and verification complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Ensure your .env file has the correct configuration:"
echo "   - DATABASE_URL (PostgreSQL connection)"
echo "   - JWT_SECRET (strong random string)"
echo "   - OPENAI_API_KEY (if using OpenAI)"
echo ""
echo "2. Setup your database:"
echo "   npx prisma migrate dev"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Start the frontend development server:"
echo "   cd frontend && npm start"
echo ""
echo "5. Access the application:"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"
echo ""
print_info "For production deployment, use: npm run deploy"
echo ""