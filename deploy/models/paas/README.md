# PaaS Deployment Model - Kubernetes (k3s)

## Overview

The PaaS (Platform as a Service) model uses Kubernetes with Helm for declarative deployment. This is perfect for:

- Production-like local/cloud demonstration
- GitOps and infrastructure automation
- Learning Kubernetes patterns
- Testing deployment strategies before production

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster (k3s)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Ingress (NGINX)                       │   │
│  │             MetalLB Load Balancer                   │   │
│  └────────────────┬────────────────────────────────────┘   │
│                   │                                        │
│  ┌────────────────┴────────────────────────────────────┐   │
│  │            Services                                │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  │   │
│  │  │ Frontend   │  │   Backend  │  │PostgreSQL  │  │   │
│  │  │  (Nginx)   │  │  (Node.js) │  │  (Pod)     │  │   │
│  │  └────────────┘  └────────────┘  └────────────┘  │   │
│  │                                               │     │   │
│  │  ┌────────────┐  ┌────────────┐              │     │   │
│  │  │   Redis    │  │ ConfigMap  │              │     │   │
│  │  │   (Pod)    │  │ & Secrets  │              │     │   │
│  │  └────────────┘  └────────────┘              │     │   │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- **k3s** (lightweight Kubernetes) - installed by script
- **kubectl** - Kubernetes CLI
- **Helm 3** - Package manager
- **(Optional) k9s** - Terminal UI for Kubernetes

### Install Prerequisites (if not present)

```bash
# k3s (includes kubectl)
curl -sfL https://get.k3s.io | sh -

# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# k9s (optional)
brew install k9s  # macOS
# or see https://github.com/derailed/k9s/releases
```

Configure kubectl (if needed):
```bash
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
chmod 600 ~/.kube/config
```

Verify:
```bash
kubectl cluster-info
kubectl get nodes
helm version
```

## 🚀 Quick Start

### 1. Setup Cluster (if not already running)

```bash
cd deploy/models/paas
./k3s-setup.sh
```

This script will:
- Install k3s, kubectl, Helm, k9s (if missing)
- Configure kubectl to use k3s cluster
- Install MetalLB for load balancing
- Install NGINX Ingress Controller
- Create required namespaces
- Wait for cluster to be ready

**Duration:** ~10 minutes

### 2. Build and Load Docker Images

```bash
# Build the images (from project root)
./deploy/scripts/build-for-k8s.sh

# Or manually:
docker build -t bizbuddy-backend:dev -f Dockerfile .
docker build -t bizbuddy-frontend:dev -f frontend/Dockerfile frontend/

# Load images into k3s (for local demo without registry)
k3s ctr images import bizbuddy-backend-dev.tar
k3s ctr images import bizbuddy-frontend-dev.tar
```

Or use `skopeo` to copy directly:
```bash
skopeo copy docker-daemon:bizbuddy-backend:dev docker://bizbuddy-backend:dev
k3s ctr images import bizbuddy-backend:dev
```

### 3. Create Secrets

**IMPORTANT:** Replace values with your actual configuration!

```bash
# Create namespace
kubectl create namespace bizbuddy

# Create JWT secret (generate strong random string)
kubectl create secret generic bizbuddy-secrets \
  --from-literal=jwt-secret='your-super-secret-jwt-key-min-32-chars' \
  --from-literal=openai-api-key='sk-your-openai-key' \
  --namespace bizbuddy

# Create PostgreSQL secret (if using Bitnami chart)
helm install postgresql bitnami/postgresql \
  --namespace bizbuddy \
  --set postgresqlPassword=your-db-password \
  --set auth.database=bizbuddy_db

# Create Redis secret (if using Bitnami chart)
helm install redis bitnami/redis \
  --namespace bizbuddy \
  --set auth.password=your-redis-password
```

### 4. Deploy with Helm

```bash
cd deploy/models/paas

# Install dependencies (postgres, redis)
helm dependency build charts/bizbuddy-backend

# Deploy backend
helm install bizbuddy-backend charts/bizbuddy-backend \
  -f values/dev.yaml \
  --namespace bizbuddy \
  --set config.JWT_SECRET=$(kubectl get secret bizbuddy-secrets -n bizbuddy -o jsonpath="{.data.jwt-secret}" | base64 -d) \
  --set config.OPENAI_API_KEY=$(kubectl get secret bizbuddy-secrets -n bizbuddy -o jsonpath="{.data.openai-api-key}" | base64 -d) \
  --wait --timeout 5m

# Deploy frontend
helm install bizbuddy-frontend charts/bizbuddy-frontend \
  -f values/dev.yaml \
  --namespace bizbuddy \
  --set config.REACT_APP_API_URL=http://bizbuddy-backend.bizbuddy.svc.cluster.local:3000 \
  --wait --timeout 5m
```

### 5. Access the Application

```bash
# Get ingress IP (MetalLB assigns from config range)
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Example output:
# NAME                       TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)
# ingress-nginx-controller   LoadBalancer   10.43.120.10   192.168.1.200   80:31234/TCP,443:32491/TCP

# Access via external IP
# Frontend: http://192.168.1.200
# Backend API: http://192.168.1.200 (or /api paths)

# Or port-forward for local testing
kubectl port-forward svc/bizbuddy-backend 3000:3000 -n bizbuddy
kubectl port-forward svc/bizbuddy-frontend 3001:80 -n bizbuddy

# Test health
curl http://localhost:3000/health
```

## 📊 Monitor Deployment

### Watch Pods

```bash
# Watch all pods in bizbuddy namespace
kubectl get pods -n bizbuddy -w

# Or use k9s
k9s -n bizbuddy
```

### View Logs

```bash
# All pods
kubectl logs -l app.kubernetes.io/name=bizbuddy-backend -n bizbuddy -f

# Specific pod
kubectl logs -f deployment/bizbuddy-backend -n bizbuddy
kubectl logs -f deployment/bizbuddy-frontend -n bizbuddy
```

### Check Ingress

```bash
kubectl get ingress -n bizbuddy
kubectl describe ingress bizbuddy-backend -n bizbuddy
```

### Resource Usage

```bash
# Top pods
kubectl top pods -n bizbuddy

# Detailed pod info
kubectl describe pod <pod-name> -n bizbuddy
```

## 🔄 Common Operations

### Upgrade

```bash
# After code changes and new image build
helm upgrade bizbuddy-backend charts/bizbuddy-backend \
  -f values/dev.yaml \
  --set image.tag=v2.0.0 \
  --wait \
  -n bizbuddy

# Watch rollout
kubectl rollout status deployment/bizbuddy-backend -n bizbuddy
```

### Rollback

```bash
# View release history
helm history bizbuddy-backend -n bizbuddy

# Rollback to revision 1
helm rollback bizbuddy-backend 1 -n bizbuddy
```

### Clean Up

```bash
# Uninstall releases
helm uninstall bizbuddy-backend -n bizbuddy
helm uninstall bizbuddy-frontend -n bizbuddy
helm uninstall postgresql -n bizbuddy  # if using Bitnami
helm uninstall redis -n bizbuddy       # if using Bitnami

# Delete namespace (WARNING: deletes all data!)
kubectl delete namespace bizbuddy

# Or clean everything with script
./scripts/reset-demo.sh
```

### Troubleshooting

#### Pods stuck in Pending

```bash
kubectl describe pod <pod> -n bizbuddy
# Check for resource constraints
# Check node capacity: kubectl describe nodes
```

#### CrashLoopBackOff

```bash
kubectl logs -p <pod> -n bizbuddy  # Get previous container logs
# Common issues:
# - Missing secrets (check secret names)
# - Insufficient memory (increase resources.limits)
# - Database not reachable (check connectivity)
```

#### Ingress not routing

```bash
# Verify ingress controller is running
kubectl get pods -n ingress-nginx

# Check ingress class
kubectl get ingressclass

# Check MetalLB is configured
kubectl get configmap -n metallb-system

# Test service directly
kubectl port-forward svc/bizbuddy-backend 3000:3000 -n bizbuddy
```

## 🎛️ Customization

### Enable Autoscaling

Edit `values.yaml` or pass CLI flag:

```bash
helm upgrade bizbuddy-backend charts/bizbuddy-backend \
  --set autoscaling.enabled=true \
  --set autoscaling.minReplicas=2 \
  --set autoscaling.maxReplicas=10 \
  --set autoscaling.targetCPUUtilizationPercentage=70 \
  -n bizbuddy
```

### High Availability (PDB)

Enable PodDisruptionBudget:

```bash
helm upgrade bizbuddy-backend charts/bizbuddy-backend \
  --set pdb.create=true \
  --set pdb.minAvailable=1 \
  -n bizbuddy
```

### Custom Ingress Annotations

For AWS ALB:
```yaml
ingress:
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/healthcheck-path: /health
```

For GCE LoadBalancer:
```yaml
ingress:
  annotations:
    kubernetes.io/ingress.global-static-ip-name: "bizbuddy-ip"
    networking.gke.io/load-balancer-type: "External"
```

## 📈 Monitoring Stack

### Install Prometheus Stack

```bash
# Add kube-prometheus-stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install monitoring in separate namespace
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace bizbuddy-monitoring \
  --create-namespace
```

### Configure ServiceMonitor

Create `monitoring/servicemonitor.yaml`:

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

Apply:
```bash
kubectl apply -f monitoring/servicemonitor.yaml
```

## 📚 Advanced Topics

### Multi-Tenancy

For SaaS demo with multiple tenants, see `MULTI_TENANCY.md` in the main deploy directory.

### StatefulSets (if needed)

If you need persistent storage for PostgreSQL (instead of external), deploy as StatefulSet:

```bash
helm install postgresql bitnami/postgresql \
  --set persistence.enabled=true \
  --set persistence.size=8Gi \
  ...
```

### Named Ports

The chart uses named ports (`http`). If you need custom port names, edit the Service template.

## 🆘 Troubleshooting

### Detailed troubleshooting guide

See [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md) in the root.

### Common Issues

1. **ImagePullBackOff**: Ensure image exists in registry or loaded into k3s
2. **CrashLoopBackOff**: Check logs, missing secrets
3. **Pending pods**: Insufficient resources or PVC not bound
4. **Ingress 404**: Ingress controller not installed, or wrong host
5. **WebSocket not working**: Check Socket.IO ingress annotations

### Get Help

1. `kubectl describe <resource> -n bizbuddy`
2. `kubectl logs <pod> -n bizbuddy --previous`
3. Check [Helm docs](https://helm.sh/docs/)
4. Check [Kubernetes docs](https://kubernetes.io/docs/)

---

**Last Updated:** 2025-03-11
**Status:** ✅ Production Ready
**K8s Version:** 1.20+
**Helm Version:** 3.x
