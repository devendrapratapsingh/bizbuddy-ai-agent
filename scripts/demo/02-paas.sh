#!/bin/bash

# Demo 2: PaaS Deployment with Kubernetes (k3s)
# This script demonstrates Platform-as-a-Service with local Kubernetes

set -e

cd "$(dirname "$0")/../.."

echo "=========================================="
echo "🎯 DEMO 2: PaaS Deployment (k3s Kubernetes)"
echo "=========================================="
echo ""
echo "This demonstrates the Platform-as-a-Service pattern:"
echo "  • Local Kubernetes cluster (k3s)"
echo "  • Helm charts for declarative deployment"
echo "  • Service discovery and load balancing"
echo "  • Same manifests as cloud (portable)"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
missing=0

if ! command -v kubectl &> /dev/null; then
  echo "❌ kubectl not found."
  missing=1
else
  echo "✅ kubectl: $(kubectl version --client --short 2>/dev/null || echo 'installed')"
fi

if ! command -v helm &> /dev/null; then
  echo "❌ Helm not found."
  missing=1
else
  echo "✅ Helm: $(helm version --short 2>/dev/null || echo 'installed')"
fi

if ! command -v k3s &> /dev/null && ! kubectl cluster-info &> /dev/null; then
  echo "⚠️  k3s not detected and no cluster accessible."
fi

if [[ $missing -eq 1 ]]; then
  echo ""
  echo "Installing missing prerequisites..."
  echo "Choose option:"
  echo "  1) Run k3s-setup.sh (installs k3s, kubectl, helm)"
  echo "  2) Abort and install manually"
  read -p "Enter choice [1/2]: " choice

  if [[ "$choice" == "1" ]]; then
    echo "Running k3s-setup.sh..."
    cd deploy/models/paas
    ./k3s-setup.sh
    cd "$OLDPWD"
  else
    echo "Please install missing prerequisites and re-run."
    exit 1
  fi
fi

echo ""

# Check if cluster is accessible
echo "🔍 Checking cluster connectivity..."
if ! kubectl cluster-info &> /dev/null; then
  echo "❌ Cannot connect to Kubernetes cluster."
  echo "   Run: cd deploy/models/paas && ./k3s-setup.sh"
  exit 1
fi

echo "✅ Connected to cluster!"
echo ""

# Setup cluster if needed
if kubectl get ns kube-system &> /dev/null; then
  echo "📊 Cluster Status:"
  kubectl get nodes -o wide --no-headers | head -3
  echo ""
fi

# Build and load images
echo "🔨 Building Docker images for Kubernetes..."
cd "$(dirname "$0")/../.."

echo "Building backend..."
docker build -t bizbuddy-backend:demo -f Dockerfile .
if command -v k3s &> /dev/null; then
  echo "Loading backend image into k3s..."
  k3s ctr images import docker.io/library/bizbuddy-backend:demo 2>/dev/null || true
fi

echo "Building frontend..."
docker build -t bizbuddy-frontend:demo -f frontend/Dockerfile frontend/
if command -v k3s &> /dev/null; then
  echo "Loading frontend image into k3s..."
  k3s ctr images import docker.io/library/bizbuddy-frontend:demo 2>/dev/null || true
fi

echo ""
echo "✅ Images built and loaded"
echo ""

# Create namespace
echo "📁 Creating namespace..."
kubectl create namespace bizbuddy --dry-run=client -o yaml | kubectl apply -f -

# Deploy with Helm
echo ""
echo "📦 Deploying with Helm..."
cd deploy/models/paas

# Package charts (if needed)
mkdir -p .charts
helm package charts/bizbuddy-backend --destination .charts/ 2>/dev/null || true

echo "Deploying backend..."
helm upgrade --install bizbuddy-backend charts/bizbuddy-backend \
  -n bizbuddy \
  -f values/dev.yaml \
  --set image.tag=demo \
  --wait --timeout 5m

echo "Deploying frontend..."
helm upgrade --install bizbuddy-frontend charts/bizbuddy-frontend \
  -n bizbuddy \
  -f values/dev.yaml \
  --set image.tag=demo \
  --set config.REACT_APP_API_URL=http://bizbuddy-backend.bizbuddy.svc.cluster.local:3000 \
  --wait --timeout 5m

# Show status
echo ""
echo "📊 Deployment Status:"
kubectl get pods,svc,ingress -n bizbuddy --no-headers
echo ""

# Get ingress IP
ingress_ip=""
if kubectl get svc -n ingress-nginx ingress-nginx-controller &>/dev/null; then
  ingress_ip=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
fi

echo "=========================================="
echo "✅ PaaS DEMO COMPLETE"
echo "=========================================="
echo ""

if [[ -n "$ingress_ip" ]]; then
  echo "🌐 Access the application:"
  echo "   Frontend: http://$ingress_ip"
  echo "   Backend:  http://$ingress_ip/health"
else
  echo "🌐 Access the application (port-forward):"
  echo "   kubectl port-forward svc/bizbuddy-backend 3000:3000 -n bizbuddy"
  echo "   kubectl port-forward svc/bizbuddy-frontend 3001:80 -n bizbuddy"
  echo ""
  echo "   Then visit: http://localhost:3000"
fi

echo ""
echo "📊 Kubernetes commands:"
echo "   View pods:     kubectl get pods -n bizbuddy -w"
echo "   View logs:     kubectl logs -f deployment/bizbuddy-backend -n bizbuddy"
echo "   Describe pod:  kubectl describe pod <pod-name> -n bizbuddy"
echo "   Helm status:   helm list -n bizbuddy"
echo ""
echo "💡 This PaaS model demonstrates:"
echo "   • Kubernetes declarative deployment"
echo "   • Helm chart packaging"
echo "   • Service discovery (DNS within cluster)"
echo "   • Load balancing via ingress"
echo "   • Same K8s manifests used in production clouds (EKS/GKE/AKS)"
echo ""
echo "Next demo: Run 03-saas.sh to see Terraform cloud deployment (plan only)"
echo ""
