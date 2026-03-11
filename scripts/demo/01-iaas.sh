#!/bin/bash

# Demo 1: IaaS Deployment with Docker Compose
# This script demonstrates the simplest deployment model

set -e

cd "$(dirname "$0")/../.."

echo "=========================================="
echo "🎯 DEMO 1: IaaS Deployment (Docker Compose)"
echo "=========================================="
echo ""
echo "This demonstrates the Infrastructure-as-a-Service pattern:"
echo "  • Single-host deployment"
echo "  • Docker Compose orchestration"
echo "  • Local persistence with volumes"
echo "  • Fast setup (~5 minutes)"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Please install Docker Desktop."
  exit 1
fi

if ! docker compose version &> /dev/null; then
  echo "❌ Docker Compose not found. Please install Docker Compose v2.2+."
  exit 1
fi

echo "✅ Docker: $(docker --version | cut -d' ' -f3 | head -1)"
echo "✅ Docker Compose: $(docker compose version | grep -oE 'v[0-9.]+' | head -1)"
echo ""

# Navigate to IaaS directory
cd deploy/models/iaas

# Setup environment
echo "🔧 Setting up IaaS environment..."
if [[ ! -f ".env" ]]; then
  echo "Creating .env from template..."
  cp .env.iaas .env
  echo ""
  echo "⚠️  IMPORTANT: You should edit .env and add your configuration:"
  echo "   1. Generate JWT_SECRET: openssl rand -base64 64"
  echo "   2. Add OPENAI_API_KEY from your OpenAI dashboard"
  echo ""
  read -p "Press Enter to continue with demo-default values (not for production)..."
fi

# Build and deploy
echo ""
echo "🚀 Deploying BizBuddy with Docker Compose..."
echo ""
docker-compose up -d --build

# Wait for services
echo ""
echo "⏳ Waiting for services to become healthy..."
sleep 15

# Check status
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""

# Health check
echo "🏥 Testing health endpoint..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
  echo "✅ Backend is healthy!"
else
  echo "⚠️  Health check not responding yet. Waiting..."
  sleep 5
  curl -s http://localhost:3000/health || echo "❌ Health check failed"
fi

echo ""
echo "=========================================="
echo "✅ IaaS DEMO COMPLETE"
echo "=========================================="
echo ""
echo "🌐 Access the application:"
echo "   Frontend/API: http://localhost:3000"
echo "   Health:      http://localhost:3000/health"
echo ""
echo "📊 Commands:"
echo "   View logs:     docker-compose logs -f app"
echo "   View all:      docker-compose logs -f"
echo "   Stop:          docker-compose down"
echo "   Stop + wipe:   docker-compose down -v  (WARNING: deletes database)"
echo "   Restart:       docker-compose restart"
echo ""
echo "💡 This IaaS model demonstrates:"
echo "   • Containerization with Docker"
echo "   • Multi-service orchestration (app, db, redis)"
echo "   • Service dependencies and health checks"
echo "   • Volume persistence"
echo "   • Single-host deployment pattern"
echo ""
echo "Next demo: Run 02-paas.sh to see Kubernetes deployment"
echo ""
