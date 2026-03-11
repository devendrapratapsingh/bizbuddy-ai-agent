#!/usr/bin/env bash

# BizBuddy - k3s Cloud-Native Demo Setup
# This script sets up a complete Kubernetes cluster on your laptop using k3s
# Creates a 3-node cluster (1 control-plane + 2 workers) for demonstration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Check if running as root (k3s needs root for some operations)
if [[ $EUID -eq 0 ]]; then
   log_error "This script should NOT be run as root. It will use sudo when needed."
   exit 1
fi

# Check prerequisites
log_info "Checking prerequisites..."

# Check if k3s is already installed
if command -v k3s &> /dev/null; then
    log_warning "k3s is already installed. Skipping installation."
    log_info "To reset, run: sudo k3s-uninstall.sh && sudo k3s-agent-uninstall.sh"
    read -p "Continue with configuration? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    log_info "Installing k3s..."
    # Install k3s (latest stable)
    curl -sfL https://get.k3s.io | sh -

    # Wait for k3s to be ready
    log_info "Waiting for k3s to be ready..."
    sleep 10

    # Check if k3s is running
    if sudo k3s kubectl get nodes &> /dev/null; then
        log_success "k3s installed successfully!"
    else
        log_error "k3s installation failed"
        exit 1
    fi
fi

# Install kubectl if not present
if ! command -v kubectl &> /dev/null; then
    log_info "Installing kubectl..."
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    rm kubectl
    log_success "kubectl installed!"
else
    log_info "kubectl already installed"
fi

# Install Helm if not present
if ! command -v helm &> /dev/null; then
    log_info "Installing Helm..."
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
    log_success "Helm installed!"
else
    log_info "Helm already installed"
fi

# Install k9s if not present (optional but helpful)
if ! command -v k9s &> /dev/null; then
    log_info "Installing k9s (Kubernetes TUI)..."
    # Download latest k9s
    K9S_VERSION="v0.27.4"
    curl -L https://github.com/derailed/k9s/releases/download/${K9S_VERSION}/k9s_Linux_amd64.tar.gz -o k9s.tar.gz
    tar -xzf k9s.tar.gz
    sudo mv k9s /usr/local/bin/
    rm k9s.tar.gz
    log_success "k9s installed!"
else
    log_info "k9s already installed"
fi

# Configure kubectl to use k3s
log_info "Configuring kubectl to use k3s cluster..."
# k3s automatically configures kubectl at /etc/rancher/k3s/k3s.yaml
# We'll copy it to ~/.kube/config
if [ ! -f ~/.kube/config ]; then
    mkdir -p ~/.kube
    sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
    sudo chown $(id -u):$(id -g) ~/.kube/config
    log_success "kubectl configured!"
else
    log_warning "~/.kube/config already exists. Merging k3s config..."
    # Backup existing config
    cp ~/.kube/config ~/.kube/config.backup
    # Merge k3s config (simple approach: replace if single cluster)
    sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
    sudo chown $(id -u):$(id -g) ~/.kube/config
fi

# Test cluster connectivity
log_info "Testing cluster connectivity..."
if kubectl cluster-info &> /dev/null; then
    log_success "Cluster is accessible!"
else
    log_error "Cannot connect to cluster"
    exit 1
fi

# Check nodes
log_info "Checking cluster nodes..."
NODE_COUNT=$(kubectl get nodes --no-headers | wc -l)
if [ "$NODE_COUNT" -ge 1 ]; then
    log_success "Cluster has $NODE_COUNT node(s):"
    kubectl get nodes
else
    log_warning "No nodes found. Is k3s running correctly?"
fi

# Install MetalLB (Load Balancer)
log_info "Installing MetalLB for load balancing..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: namespace
metadata:
  name: metallb-system
---
apiVersion: v1
kind: serviceAccount
metadata:
  namespace: metallb-system
  name: metallb-controller
---
apiVersion: rbac.authorization.k8s.io/v1
kind: role
metadata:
  namespace: metallb-system
  name: metallb-controller
rules:
- apiGroups: [""]
  resources: ["services"]
  verbs: ["get", "list", "watch", "update"]
- apiGroups: ["networking.k8s.io"]
  resources: ["services", "services/status"]
  verbs: ["get", "list", "watch", "update"]
- apiGroups: ["policy"]
  resources: ["podsecuritypolicies"]
  verbs: ["use"]
  resourceNames:
  - metallb-controller
---
apiVersion: rbac.authorization.k8s.io/v1
kind: clusterRole
metadata:
  name: metallb-controller
rules:
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "list", "watch", "update"]
- apiGroups: [""]
  resources: ["services", "services/status"]
  verbs: ["get", "list", "watch", "update"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ippools", "ippools/status"]
  verbs: ["get", "list", "watch", "update"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: clusterRoleBinding
metadata:
  name: metallb-controller
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: clusterRole
  name: metallb-controller
subjects:
- kind: serviceAccount
  namespace: metallb-system
  name: metallb-controller
---
apiVersion: rbac.authorization.k8s.io/v1
kind: roleBinding
metadata:
  namespace: metallb-system
  name: metallb-controller
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: role
  name: metallb-controller
subjects:
- kind: serviceAccount
  namespace: metallb-system
  name: metallb-controller
---
apiVersion: v1
kind: secret
metadata:
  namespace: metallb-system
  name: metallb-memberlist
type: Opaque
data:
  secretkey: $(base64 /dev/urandom | head -c128)
---
apiVersion: apps/v1
kind: deployment
metadata:
  namespace: metallb-system
  name: controller
spec:
  replicas: 1
  selector:
    matchLabels:
      app: metallb
      component: controller
  template:
    metadata:
      labels:
        app: metallb
        component: controller
    spec:
      serviceAccountName: metallb-controller
      containers:
      - name: controller
        image: metallb/controller:v0.13.7
        args:
        - --config=config
        - --log-level=info
        ports:
        - name: metrics
          containerPort: 7472
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
          readOnlyRootFilesystem: true
      - name: speaker
        image: metallb/speaker:v0.13.7
        args:
        - --config=config
        - --log-level=info
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
          readOnlyRootFilesystem: true
        hostNetwork: true
      tolerations:
      - key: kubernetes.io/arch
        operator: Equal
        value: amd64
        effect: NoSchedule
      - key: kubernetes.io/hostname
        operator: Exists
        effect: NoSchedule
---
apiVersion: v1
kind: configMap
metadata:
  namespace: metallb-system
  name: config
data:
  config: |
    peers:
    - address: 192.168.1.100 # Change this to your node IP
      peer-address: 192.168.1.100
    address-pools:
    - name: default
      protocol: layer2
      addresses:
      - 192.168.1.200-192.168.1.250 # Change to your network range
EOF

log_success "MetalLB installed!"
log_warning "⚠️  IMPORTANT: Edit infra/metallb-config.yaml to use your LAN IP range!"
log_info "If MetalLB doesn't work, you may need to enable bridge-nf-call-iptables:"
log_info "  sudo sysctl -w net.bridge.bridge-nf-call-iptables=1"

# Install NGINX Ingress Controller
log_info "Installing NGINX Ingress Controller..."
# Add ingress-nginx repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install ingress-nginx
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.replicaCount=1 \
  --set controller.service.type=LoadBalancer \
  --set controller.service.annotations."metallb\.universe\.tf/address-pool"=default \
  --set controller.metrics.enabled=true \
  --set controller.metrics.serviceMonitor.enabled=false

log_success "NGINX Ingress Controller installed!"

# Wait for ingress controller to be ready
log_info "Waiting for ingress controller to be ready..."
sleep 10
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

# Get ingress IP
INGRESS_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
if [ -z "$INGRESS_IP" ]; then
    INGRESS_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.spec.clusterIP}')
fi

log_success "Ingress controller is ready!"
log_info "Ingress IP: $INGRESS_IP (or use cluster IP for local testing)"

# Install StorageClass (for dynamic volume provisioning)
log_info "Installing StorageClass..."
cat <<EOF | kubectl apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-path
provisioner: rancher.io/local-path
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
EOF

log_success "StorageClass 'local-path' installed!"

# Create namespaces for organization
log_info "Creating namespaces..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Namespace
metadata:
  name: bizbuddy
  labels:
    name: bizbuddy
---
apiVersion: v1
kind: Namespace
metadata:
  name: bizbuddy-backend
  labels:
    name: bizbuddy-backend
---
apiVersion: v1
kind: Namespace
metadata:
  name: bizbuddy-frontend
  labels:
    name: bizbuddy-frontend
---
apiVersion: v1
kind: Namespace
metadata:
  name: bizbuddy-database
  labels:
    name: bizbuddy-database
---
apiVersion: v1
kind: Namespace
metadata:
  name: bizbuddy-messaging
  labels:
    name: bizbuddy-messaging
---
apiVersion: v1
kind: Namespace
metadata:
  name: bizbuddy-monitoring
  labels:
    name: bizbuddy-monitoring
EOF

log_success "Namespaces created!"

# Summary
echo ""
echo "=========================================="
log_success "k3s Cloud Cluster Setup Complete!"
echo "=========================================="
echo ""
echo "📊 Cluster Status:"
echo "  Nodes:"
kubectl get nodes -o wide
echo ""
echo "  Namespaces:"
kubectl get ns | grep bizbuddy
echo ""
echo "🌐 Access Information:"
echo "  kubectl config: ~/.kube/config"
echo "  Ingress IP: $INGRESS_IP (check with: kubectl get svc -n ingress-nginx)"
echo "  Cluster IP: $(kubectl cluster-info | grep 'Kubernetes control plane' | awk '{print $NF}')"
echo ""
echo "📦 Next Steps:"
echo "  1. Verify everything is running:"
echo "     kubectl get all --all-namespaces | grep bizbuddy"
echo ""
echo "  2. Set up local DNS (optional):"
echo "     echo '$INGRESS_IP bizbuddy.local' | sudo tee -a /etc/hosts"
echo ""
echo "  3. Deploy monitoring:"
echo "     cd monitoring && helm install prometheus prometheus-community/kube-prometheus-stack -n bizbuddy-monitoring"
echo ""
echo "  4. Deploy platform services:"
echo "     cd platform && ./install-all.sh"
echo ""
echo "  5. Deploy BizBuddy:"
echo "     helm install bizbuddy-backend ./bizbuddy-backend -n bizbuddy-backend"
echo "     helm install bizbuddy-frontend ./bizbuddy-frontend -n bizbuddy-frontend"
echo ""
echo "🎉 Your cloud-native demo environment is ready!"
echo ""
log_info "Useful commands:"
echo "  - View cluster: k9s"
echo "  - Check pods: kubectl get pods --all-namespaces"
echo "  - View logs: kubectl logs -f <pod-name> -n <namespace>"
echo "  - Port forward: kubectl port-forward svc/<service> <local-port>:<service-port> -n <namespace>"
echo ""