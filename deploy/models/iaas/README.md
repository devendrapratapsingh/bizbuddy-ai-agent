# IaaS Deployment Model - Docker Compose

## Overview

The IaaS (Infrastructure as a Service) model uses Docker Compose to run all services on a single host. This is the simplest deployment pattern, ideal for:

- Local development and testing
- Proof of Concept (PoC) demonstrations
- Small team deployments
- Quick prototyping

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Single Host (Docker)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  BizBuddy   │  │ PostgreSQL  │  │    Redis    │       │
│  │    App      │  │    DB       │  │   Cache     │       │
│  │  (Node.js)  │  │             │  │             │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│         │               │                  │              │
│         └───────────────┼──────────────────┘              │
│                       └───────────────── Docker Network ──┘
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- **Docker** 20.10+ (includes Docker Compose v2)
- **Node.js** 18+ (for building the image, optional if using pre-built)
- **Git** (to clone repository)
- **At least 2GB RAM** available for Docker
- **10GB disk space** for images and data

### Check Prerequisites

```bash
docker --version        # Should show Docker version 20.10+
docker compose version  # Should show Docker Compose version v2.2+
node --version          # Should be v18.0.0 or higher
free -h                 # Check available RAM
df -h                   # Check available disk space
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd /path/to/BizBuddy
cd deploy/models/iaas
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.iaas .env

# Edit .env with your configuration (at minimum):
# - JWT_SECRET (generate a strong random string, min 32 chars)
# - OPENAI_API_KEY (from OpenAI dashboard)
nano .env
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 64
# or
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Build and Deploy

```bash
# Build Docker images and start all services
docker compose up -d --build

# View logs
docker compose logs -f app

# Check status
docker compose ps
```

### 4. Access the Application

Once all services are healthy (check with `docker compose ps`):

- **Frontend:** http://localhost:3001 (if running locally) or http://localhost:3000
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **Database:** localhost:5432 (PostgreSQL)
- **Redis Cache:** localhost:6379

## 🔧 Management Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f postgres
docker compose logs -f redis

# Last 100 lines
docker compose logs --tail=100 app
```

### Access Database

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d bizbuddy_db

# Run a query
docker compose exec postgres psql -U postgres -d bizbuddy_db -c "SELECT COUNT(*) FROM users;"

# Backup database
docker compose exec postgres pg_dump -U postgres bizbuddy_db > backup.sql
```

### Access Redis

```bash
# Connect to Redis CLI
docker compose exec redis redis-cli

# Check connectivity
docker compose exec redis redis-cli ping
# Should return: PONG

# View all keys
docker compose exec redis redis-cli keys "*"

# Flush all data (careful!)
docker compose exec redis redis-cli FLUSHALL
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart app
docker compose restart postgres

# Stop and start fresh
docker compose down
docker compose up -d
```

### Stop and Clean Up

```bash
# Stop services (preserves data volumes)
docker compose down

# Stop and remove all data (WARNING: deletes database!)
docker compose down -v

# Remove stopped containers, networks, dangling images
docker system prune -f
```

## 📊 Monitoring & Health

### Service Health Checks

Each service has built-in health checks:

```bash
# Check health status
docker compose ps

# Expected output:
# NAME                IMAGE               STATUS          PORTS
# iaas-postgres       postgres:15-alpine  healthy        5432/tcp
# iaas-redis          redis:7-alpine      healthy        6379/tcp
# iaas-app            bizbuddy:latest    healthy        0.0.0.0:3000->3000/tcp
```

### Application Health Endpoint

```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"2025-03-11T..."}
```

### View Resource Usage

```bash
# Docker stats
docker stats

# Detailed container info
docker inspect iaas-app

# Check container logs
docker logs iaas-app
```

## 🔐 Security Considerations

### Development / Demo

- Default PostgreSQL password: `password` (CHANGE FOR PRODUCTION!)
- No SSL/TLS configured
- Network is isolated via Docker bridge
- Secrets stored in `.env` file (git-ignored)

### Production Recommendations

1. **Change all default passwords**
   - Update `POSTGRES_PASSWORD` in `.env`
   - Use strong, randomly generated passwords

2. **Use Docker secrets** or external secret manager (Vault/AWS Secrets Manager)

3. **Enable SSL/TLS** for database connections

4. **Use non-root user** (already configured in Dockerfile - `USER node`)

5. **Configure firewall** to only expose necessary ports

6. **Use private Docker registry** for images instead of building locally

7. **Regular security updates**:
   ```bash
   docker compose pull  # Update base images
   docker compose up -d --build
   ```

## 🐛 Troubleshooting

### Port Already in Use

**Error:** `Error: port is already allocated`

**Solution:**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5432
lsof -i :6379

# Kill the process or change ports in .env
# Or stop conflicting docker-compose stack
docker compose down
```

### Container Fails to Start

```bash
# Check logs
docker compose logs app

# Common issues:
# - Missing JWT_SECRET: Check .env file
# - Invalid OPENAI_API_KEY: Verify key is correct
# - Database connection failed: Check postgres is healthy first
```

### Database Connection Issues

```bash
# Verify postgres is running
docker compose ps postgres

# Check if database is ready
docker compose exec postgres pg_isready -U postgres

# Wait a bit and retry (postgres takes ~10s to initialize)
sleep 5
docker compose logs postgres
```

### Out of Memory

**Error:** `Cannot start service app: failed to start shim: cannot allocate memory`

**Solution:**
```bash
# Increase Docker memory allocation
# Docker Desktop: Settings → Resources → Memory → increase to 4GB+
# Linux: Ensure sufficient swap space

# Or reduce application memory limit in docker-compose.yml
# Change deploy.resources.limits.memory to 512M
```

### Build Fails

```bash
# Clear Docker cache
docker builder prune -af

# Rebuild without cache
docker compose build --no-cache app

# Check Node.js version in Dockerfile matches local
cat Dockerfile | grep "FROM node"
```

## 🔄 migrating to PaaS or SaaS

The IaaS setup uses the same application code as PaaS and SaaS. Differences are:

| Aspect | IaaS | PaaS | SaaS |
|--------|------|------|------|
| **Orchestration** | Docker Compose | Kubernetes | Cloud K8s |
| **Config source** | .env file | ConfigMap + Secrets | Terraform variables |
| **Storage** | Local volumes | PersistentVolumeClaims | Cloud storage (S3) |
| **Networking** | Bridge network | Service + Ingress | Load Balancer + DNS |
| **Scaling** | Manual (restart) | Horizontal Pod Autoscaler | Cluster autoscaling |

To migrate to PaaS:
```bash
cd ../../paas
helm install bizbuddy ./ --wait
```

To migrate to SaaS:
```bash
cd ../../saas
terraform init
terraform plan -var="environment=dev"
terraform apply
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Best Practices for Docker Compose](https://docs.docker.com/compose/best-practices/)
- [BizBuddy Architecture](../ARCHITECTURE.md)
- [Multi-tenancy Setup](../paas/MULTI_TENANCY.md)

## 🆘 Getting Help

1. Check [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md)
2. Review application logs: `docker compose logs -f`
3. Check Docker daemon logs: `docker logs` (if using Docker Desktop)
4. Open an issue on GitHub

---

**Last Updated:** 2025-03-11
**Status:** ✅ Production Ready (for development and demo purposes)
**Portability:** Works on Linux, macOS, Windows (WSL2)
