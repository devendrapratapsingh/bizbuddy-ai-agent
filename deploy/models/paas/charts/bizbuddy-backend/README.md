# BizBuddy Backend Helm Chart

This Helm chart deploys the BizBuddy AI Agent backend to a Kubernetes cluster.

## 📦 Chart Details

- **Name:** `bizbuddy-backend`
- **Version:** 1.0.0
- **App Version:** 1.0.0
- **Type:** Application

## 🎯 Prerequisites

- Kubernetes 1.20+
- Helm 3.0+
- kubectl configured to your cluster
- PostgreSQL database (external or Bitnami chart)
- Redis instance (external or Bitnami chart)

## 📋 Quick Start

### 1. Add Helm Repository (if using dependency charts)

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

### 2. Install Chart

#### Development (local k3s cluster)

```bash
cd deploy/models/paas
helm dependency build ./charts/bizbuddy-backend
helm install bizbuddy-backend ./charts/bizbuddy-backend \
  --namespace bizbuddy-backend \
  --create-namespace \
  --set config.JWT_SECRET=$(openssl rand -base64 64) \
  --set config.OPENAI_API_KEY=your-key-here \
  --wait --timeout 5m
```

#### Production (with values file)

```bash
helm install bizbuddy-backend ./charts/bizbuddy-backend \
  -f values/prod.yaml \
  --namespace bizbuddy \
  --create-namespace \
  --wait --timeout 10m
```

### 3. Verify Deployment

```bash
# Check pods
kubectl get pods -n bizbuddy-backend -l app.kubernetes.io/name=bizbuddy-backend

# Check services
kubectl get svc -n bizbuddy-backend

# Check ingress (if enabled)
kubectl get ingress -n bizbuddy-backend

# Get external URL
kubectl get ingress bizbuddy-backend -n bizbuddy-backend -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Test health endpoint
kubectl port-forward svc/bizbuddy-backend 8080:3000 -n bizbuddy-backend
curl http://localhost:8080/health
```

## 🎛️ Configuration

### Key Values

| Parameter | Description | Default |
|------------|-------------|---------|
| `replicaCount` | Number of pod replicas | `1` |
| `image.repository` | Docker image repository | `bizbuddy-backend` |
| `image.tag` | Docker image tag | `latest` |
| `service.type` | Kubernetes service type | `ClusterIP` |
| `service.port` | Service port | `3000` |
| `ingress.enabled` | Enable ingress resource | `false` |
| `ingress.hosts[0].host` | Ingress hostname | `bizbuddy.local` |
| `resources.limits.memory` | Memory limit | `1Gi` |
| `resources.limits.cpu` | CPU limit | `1000m` |
| `autoscaling.enabled` | Enable HPA | `false` |

### Database Configuration

The chart expects an external PostgreSQL database. Configure it via:

```yaml
database:
  external: true
  host: postgres-postgresql.bizbuddy-database.svc.cluster.local
  port: 5432
  username: postgres
  database: bizbuddy_db
  existingSecret: postgresql-secret
  secretKey: postgresql-password
```

### Redis Configuration

```yaml
redis:
  external: true
  url: "redis://:password@redis-master.redis.svc.cluster.local:6379"
  existingSecret: redis-secret
  secretKey: redis-password
```

### Required Secrets

Before deploying, ensure these secrets exist (or set values to generate them):

1. **JWT Secret:** Generate a strong random string (min 32 chars)
   ```bash
   openssl rand -base64 64
   # Or via Helm:
   --set config.JWT_SECRET=$(openssl rand -base64 64)
   ```

2. **OpenAI API Key:** Get from OpenAI dashboard
   ```bash
   --set config.OPENAI_API_KEY=sk-...
   ```

3. **PostgreSQL Password:** Create secret
   ```bash
   kubectl create secret generic postgresql-secret \
     --from-literal=postgresql-password='your-password' \
     -n bizbuddy
   ```

4. **Redis Password:** Create secret (if using auth)
   ```bash
   kubectl create secret generic redis-secret \
     --from-literal=redis-password='your-password' \
     -n bizbuddy
   ```

## 📊 Environment-Specific Values

### Development (k3s local)

See `values/dev.yaml` for development configuration. Deploy with:

```bash
helm install bizbuddy-backend ./charts/bizbuddy-backend \
  -f values/dev.yaml \
  --namespace bizbuddy-backend \
  --create-namespace \
  --wait
```

### Staging

```bash
helm install bizbuddy-backend ./charts/bizbuddy-backend \
  -f values/staging.yaml \
  --namespace bizbuddy-staging \
  --create-namespace \
  --wait \
  --timeout 10m
```

### Production

```bash
helm install bizbuddy-backend ./charts/bizbuddy-backend \
  -f values/prod.yaml \
  --namespace bizbuddy \
  --create-namespace \
  --wait \
  --timeout 15m
```

## 🚀 Upgrade & Rollback

### Upgrade

```bash
# After updating chart or values
helm upgrade bizbuddy-backend ./charts/bizbuddy-backend \
  -f values/prod.yaml \
  --reuse-values \
  --wait

# Watch rollout
kubectl rollout status deployment/bizbuddy-backend -n bizbuddy
```

### Rollback

```bash
# View release history
helm history bizbuddy-backend -n bizbuddy

# Rollback to revision 1
helm rollback bizbuddy-backend 1 -n bizbuddy

# Verify
kubectl get pods -n bizbuddy -l app.kubernetes.io/instance=bizbuddy-backend
```

## 🧪 Testing

The chart includes a basic test that checks if the application's health endpoint is accessible:

```bash
# Run tests after install
helm test bizbuddy-backend -n bizbuddy

# Test should complete in ~30 seconds
kubectl get pods -n bizbuddy | grep test
```

## 📈 Monitoring

### Metrics

The application exposes Prometheus metrics on `/metrics` endpoint (if configured). Add a ServiceMonitor:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: bizbuddy-backend
  namespace: bizbuddy-monitoring
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: bizbuddy-backend
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
```

### Logs

View application logs:

```bash
# All pods
kubectl logs -l app.kubernetes.io/name=bizbuddy-backend -n bizbuddy --tail=100 -f

# Specific pod
kubectl logs -f deployment/bizbuddy-backend -n bizbuddy
```

### Health Checks

The pod defines:
- **Readiness Probe:** `/health` after 30s delay (every 10s)
- **Liveness Probe:** `/health` after 60s delay (every 20s)
- **Startup Probe:** Not enabled by default (enable for slow-starting apps)

## 🔐 Security

### Pod Security Context

The chart configures pods to run as non-root:

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  runAsGroup: 1000
  fsGroup: 1000
```

### Seccomp Profile

RuntimeDefault seccomp profile is enforced (if supported by the runtime).

### Network Policies (Optional)

For multi-tenant clusters, apply NetworkPolicy to restrict pod communication:

```bash
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: bizbuddy-backend-ingress
  namespace: bizbuddy
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: bizbuddy-backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app.kubernetes.io/name: bizbuddy-frontend
    ports:
    - protocol: TCP
      port: 3000
EOF
```

## 📦 Dependency Management

If using this chart with other charts (postgresql, redis), create a `requirements.yaml`:

```yaml
dependencies:
  - name: postgresql
    version: 15.x
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: 17.x
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
```

Then run:
```bash
helm dependency build ./charts/bizbuddy-backend
```

## 🐛 Troubleshooting

### Pods stuck in Pending

```bash
kubectl describe pod <pod-name> -n bizbuddy

# Check resource quotas
kubectl describe resourcequota -n bizbuddy

# Check node capacity
kubectl describe nodes
```

### CrashLoopBackOff

```bash
# Check logs
kubectl logs -f deployment/bizbuddy-backend -n bizbuddy --previous

# Common causes:
# - Missing JWT_SECRET or OPENAI_API_KEY
# - Database connection failed (check network policies)
# - Insufficient memory (increase resources.limits.memory)
```

### Ingress not working

```bash
# Check ingress controller is installed
kubectl get pods -n ingress-nginx

# Check ingress class
kubectl get ingressclass

# Describe ingress
kubectl describe ingress bizbuddy-backend -n bizbuddy

# Get ingress IP (may take 2-3 minutes)
kubectl get ingress -n bizbuddy -w
```

## 📚 Additional Resources

- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/)
- [BizBuddy Architecture](../../ARCHITECTURE.md)
- [Deployment Models](../../deploy/README.md)

---

**Last Updated:** 2025-03-11
**Status:** ✅ Production Ready
**Helm Version:** 3.x
