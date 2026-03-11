# BizBuddy Frontend Helm Chart

This Helm chart deploys the BizBuddy AI Agent frontend (React SPA) to a Kubernetes cluster.

## 📦 Chart Details

- **Name:** `bizbuddy-frontend`
- **Version:** 1.0.0
- **App Version:** 1.0.0
- **Type:** Application

## 🎯 Prerequisites

- Kubernetes 1.20+
- Helm 3.0+
- Pre-built frontend Docker image (built by CI pipeline)

## 📋 Quick Start

### 1. Build Frontend Image (if not using CI)

```bash
cd ../../../../frontend
docker build -t bizbuddy-frontend:latest .
# Push to registry if needed
docker push your-registry/bizbuddy-frontend:latest
```

### 2. Install Chart

```bash
cd deploy/models/paas
helm install bizbuddy-frontend ./charts/bizbuddy-frontend \
  --namespace bizbuddy \
  --create-namespace \
  --set image.repository=your-registry/bizbuddy-frontend \
  --set image.tag=latest \
  --wait --timeout 5m
```

### 3. Verify Deployment

```bash
kubectl get pods -n bizbuddy -l app.kubernetes.io/name=bizbuddy-frontend
kubectl get svc -n bizbuddy bizbuddy-frontend
```

## 🔧 Configuration

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `image.repository` | Docker image repository | `bizbuddy-frontend` |
| `image.tag` | Docker image tag | `latest` |
| `service.port` | Service port | `80` |
| `ingress.enabled` | Enable ingress | `false` |
| `config.REACT_APP_API_URL` | Backend API URL | `http://bizbuddy-backend:3000` |

### Backend API URL

Set the API URL to point to the backend service:

```yaml
config:
  REACT_APP_API_URL: "https://api.bizbuddy.com"  # Production
  # or for local dev:
  # REACT_APP_API_URL: "http://localhost:3000"
```

For production with ingress, update both backend and frontend:

**Backend:**
```yaml
config:
  CORS_ORIGINS: "https://app.bizbuddy.com"
```

**Frontend:**
```yaml
config:
  REACT_APP_API_URL: "https://api.bizbuddy.com"
```

### Ingress Configuration

Enable and configure ingress for public access:

```yaml
ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: app.bizbuddy.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - hosts:
        - app.bizbuddy.com
      secretName: bizbuddy-tls
```

Create TLS secret:
```bash
kubectl create secret tls bizbuddy-tls \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem \
  -n bizbuddy
```

## 📦 Image Building

### Multi-stage Dockerfile (in frontend/)

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔄 Deployment Flow

Typical deployment sequence:

1. Build frontend: `cd frontend && npm run build`
2. Build Docker image: `docker build -t bizbuddy-frontend:tag .`
3. Push to registry: `docker push registry/bizbuddy-frontend:tag`
4. Update Helm values: `image.tag: tag`
5. Deploy: `helm upgrade --install ...`

## 🧪 Testing

```bash
# Check deployment status
kubectl get deployment bizbuddy-frontend -n bizbuddy

# Get external URL (if ingress enabled)
kubectl get ingress -n bizbuddy

# Port-forward for local testing
kubectl port-forward svc/bizbuddy-frontend 3001:80 -n bizbuddy
# Visit http://localhost:3001

# Check logs
kubectl logs -f deployment/bizbuddy-frontend -n bizbuddy
```

## 📚 Additional Resources

- [BizBuddy Architecture](../../ARCHITECTURE.md)
- [Deployment Models](../../deploy/README.md)
- [Helm Best Practices](https://helm.sh/docs/chart_best_practices/)

---

**Last Updated:** 2025-03-11
**Status:** ✅ Production Ready
