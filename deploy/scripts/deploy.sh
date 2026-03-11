#!/bin/bash

# BizBuddy Unified Deployment Script
# Supports IaaS (Docker Compose), PaaS (Kubernetes), and SaaS (Terraform)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Default values
MODEL=""
ENVIRONMENT="dev"
ACTION="deploy"
APPLY=true
SKIP_BUILD=false
HELM_FLAGS=""
TERRAFORM_FLAGS=""
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Usage
usage() {
  cat <<EOF
BizBuddy Unified Deployment Script

Usage: $0 [OPTIONS]

Deploy BizBuddy across multiple infrastructure models:
  - IaaS: Docker Compose (local)
  - PaaS: Kubernetes with Helm (local k3s or cloud)
  - SaaS: Terraform (cloud provider)

Options:
  --model=<iaas|paas|saas>    Deployment model (required)
  --env=<dev|staging|prod>    Environment (default: dev)
  --action=<deploy|plan|destroy>  Terraform action (SaaS only, default: deploy)
  --no-apply                 Show plan only (SaaS only, don't apply)
  --skip-build              Skip Docker image build
  --helm-flags=<flags>      Additional Helm flags
  --terraform-flags=<flags> Additional Terraform flags
  --help                    Show this help message

Examples:
  # IaaS deployment (Docker Compose)
  $0 --model=iaas --env=dev

  # PaaS deployment (Kubernetes)
  $0 --model=paas --env=dev

  # SaaS plan only (don't apply)
  $0 --model=saas --env=dev --action=plan --no-apply

  # SaaS full deployment
  $0 --model=saas --env=prod --action=deploy

  # SaaS destroy (cleanup)
  $0 --model=saas --env=dev --action=destroy

Environment-specific Notes:
  IaaS: Uses docker-compose in deploy/models/iaas/
  PaaS: Uses Helm charts in deploy/models/paas/
  SaaS: Uses Terraform in deploy/models/saas/environments/<env>

EOF
  exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --model=*)
      MODEL="${1#*=}"
      ;;
    --env=*)
      ENVIRONMENT="${1#*=}"
      ;;
    --action=*)
      ACTION="${1#*=}"
      ;;
    --no-apply)
      APPLY=false
      ;;
    --skip-build)
      SKIP_BUILD=true
      ;;
    --helm-flags=*)
      HELM_FLAGS="${1#*=}"
      ;;
    --terraform-flags=*)
      TERRAFORM_FLAGS="${1#*=}"
      ;;
    --help)
      usage
      ;;
    *)
      log_error "Unknown option: $1"
      usage
      ;;
  esac
  shift
done

# Validate required parameters
if [[ -z "$MODEL" ]]; then
  log_error "No deployment model specified!"
  log_info "Use --model=iaas|paas|saas"
  usage
fi

if [[ ! "$MODEL" =~ ^(iaas|paas|saas)$ ]]; then
  log_error "Invalid model: $MODEL"
  log_info "Valid models: iaas, paas, saas"
  exit 1
fi

log_info "Deploying BizBuddy [$MODEL] in [$ENVIRONMENT] environment..."
echo ""

# ============================================
# IaaS: Docker Compose Deployment
# ============================================
deploy_iaas() {
  log_info "Starting IaaS (Docker Compose) deployment..."

  local iaas_dir="$DEPLOY_DIR/models/iaas"
  cd "$iaas_dir"

  # Check prerequisites
  if ! command -v docker &> /dev/null; then
    log_error "Docker not found. Please install Docker first."
    exit 1
  fi

  if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose not found. Please install Docker Compose."
    exit 1
  fi

  # Check .env file
  if [[ ! -f ".env" ]]; then
    log_warning ".env file not found in $iaas_dir"
    log_info "Copying from .env.iaas..."
    cp .env.iaas .env
    log_warning "⚠️  Please edit .env file and add your configuration:"
    log_warning "   - JWT_SECRET (generate: openssl rand -base64 64)"
    log_warning "   - OPENAI_API_KEY (from OpenAI dashboard)"
    read -p "Press Enter to continue after editing .env, or Ctrl+C to abort..."
  fi

  # Validate required environment variables
  log_info "Validating environment variables..."
  if ! grep -q "JWT_SECRET=change_this" .env 2>/dev/null && grep -q "JWT_SECRET=your-" .env 2>/dev/null; then
    log_error "JWT_SECRET not set properly in .env"
    exit 1
  fi
  if ! grep -q "OPENAI_API_KEY=" .env; then
    log_error "OPENAI_API_KEY not set in .env"
    exit 1
  fi

  # Build images (unless skipped)
  if [[ "$SKIP_BUILD" = false ]]; then
    log_info "Building Docker images..."
    log_info "This may take 5-10 minutes on first build..."
    docker-compose build --progress=plain
  else
    log_info "Skipping build (--skip-build)"
  fi

  # Start services
  log_info "Starting services with docker-compose..."
  docker-compose up -d

  # Wait for services to be healthy
  log_info "Waiting for services to be healthy..."
  sleep 10

  # Check service status
  log_info "Checking service status..."
  docker-compose ps

  # Test health endpoint
  log_info "Testing health endpoint..."
  if curl -s http://localhost:3000/health > /dev/null; then
    log_success "✅ Application is healthy!"
  else
    log_warning "⚠️  Health check failed - check logs: docker-compose logs app"
  fi

  echo ""
  log_success "🎉 IaaS deployment complete!"
  echo ""
  echo "🌐 Access URLs:"
  echo "   Frontend/API: http://localhost:3000"
  echo "   Health:      http://localhost:3000/health"
  echo ""
  echo "📊 Management commands:"
  echo "   View logs:    docker-compose logs -f"
  echo "   Stop:         docker-compose down"
  echo "   Restart:      docker-compose restart"
  echo "   Clean (wipe): docker-compose down -v"
  echo ""
}

# ============================================
# PaaS: Kubernetes Deployment
# ============================================
deploy_paas() {
  log_info "Starting PaaS (Kubernetes) deployment..."

  local paas_dir="$DEPLOY_DIR/models/paas"
  cd "$paas_dir"

  # Check prerequisites
  if ! command -v kubectl &> /dev/null; then
    log_error "kubectl not found. Please install kubectl first."
    exit 1
  fi

  if ! command -v helm &> /dev/null; then
    log_error "Helm not found. Please install Helm first."
    exit 1
  fi

  # Check cluster connectivity
  if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster."
    log_info "Make sure k3s or another cluster is running."
    log_info "Run: $DEPLOY_DIR/models/paas/k3s-setup.sh (for local demo)"
    exit 1
  fi

  log_success "✅ Connected to Kubernetes cluster"
  kubectl get nodes --short

  # Build and load images if not skipping
  if [[ "$SKIP_BUILD" = false ]]; then
    log_info "Building Docker images (from project root)..."
    cd "$DEPLOY_DIR/../.."
    docker build -t bizbuddy-backend:latest -f Dockerfile .
    docker build -t bizbuddy-frontend:latest -f frontend/Dockerfile frontend/

    # Check if k3s, load images into cluster
    if command -v k3s &> /dev/null; then
      log_info "Loading images into k3s..."
      k3s ctr images import docker.io/library/bizbuddy-backend:latest 2>/dev/null || true
      k3s ctr images import docker.io/library/bizbuddy-frontend:latest 2>/dev/null || true
    fi
  else
    log_info "Skipping build (--skip-build)"
  fi

  cd "$paas_dir"

  # Create namespace if not exists
  kubectl create namespace bizbuddy --dry-run=client -o yaml | kubectl apply -f -

  # Package Helm chart
  log_info "Packaging Helm charts..."
  mkdir -p .charts
  helm dependency build charts/bizbuddy-backend 2>/dev/null || true
  helm package charts/bizbuddy-backend --destination .charts/ 2>/dev/null || true

  # Deploy backend
  log_info "Deploying backend..."
  helm upgrade --install bizbuddy-backend charts/bizbuddy-backend \
    -n bizbuddy \
    -f values/$ENVIRONMENT.yaml \
    --set image.tag=latest \
    --wait --timeout 5m \
    $HELM_FLAGS

  # Deploy frontend
  log_info "Deploying frontend..."
  helm upgrade --install bizbuddy-frontend charts/bizbuddy-frontend \
    -n bizbuddy \
    -f values/$ENVIRONMENT.yaml \
    --set image.tag=latest \
    --set config.REACT_APP_API_URL=http://bizbuddy-backend.bizbuddy.svc.cluster.local:3000 \
    --wait --timeout 5m \
    $HELM_FLAGS

  # Check deployment status
  echo ""
  log_info "Checking deployment status..."
  kubectl get pods,svc,ingress -n bizbuddy --no-headers

  # Get access URL
  if [[ "$ENVIRONMENT" = "dev" ]]; then
    log_info "Dev environment - use port-forward:"
    echo "  kubectl port-forward svc/bizbuddy-backend 3000:3000 -n bizbuddy"
    echo "  kubectl port-forward svc/bizbuddy-frontend 3001:80 -n bizbuddy"
  else
    local ingress_ip
    ingress_ip=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending...")
    echo ""
    log_success "🎉 PaaS deployment complete!"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Backend:  http://$ingress_ip/health"
    echo "   Frontend: http://$ingress_ip"
    echo ""
  fi

  echo ""
  log_info "📊 Useful commands:"
  echo "   View pods:      kubectl get pods -n bizbuddy -w"
  echo "   View logs:      kubectl logs -f deployment/bizbuddy-backend -n bizbuddy"
  echo "   Describe pod:   kubectl describe pod <pod> -n bizbuddy"
  echo "   Shell into pod: kubectl exec -it <pod> -n bizbuddy -- /bin/sh"
  echo ""
}

# ============================================
# SaaS: Terraform Cloud Deployment
# ============================================
deploy_saas() {
  log_info "Starting SaaS (Terraform) deployment..."

  local env_dir="$DEPLOY_DIR/models/saas/environments/$ENVIRONMENT"
  cd "$env_dir"

  # Check prerequisites
  if ! command -v terraform &> /dev/null; then
    log_error "Terraform not found. Please install Terraform first."
    exit 1
  fi

  # Check terraform.tfvars exists
  if [[ ! -f "terraform.tfvars" ]]; then
    log_warning "terraform.tfvars not found in $env_dir"
    if [[ -f "terraform.tfvars.example" ]]; then
      log_info "Copying example and opening for editing..."
      cp terraform.tfvars.example terraform.tfvars
      ${EDITOR:-nano} terraform.tfvars
    else
      log_error "No terraform.tfvars or terraform.tfvars.example found!"
      exit 1
    fi
  fi

  # Initialize Terraform
  if [[ ! -d ".terraform" ]]; then
    log_info "Initializing Terraform..."
    terraform init -backend-config="bucket=bizbuddy-tfstate-$ENVIRONMENT" 2>/dev/null || terraform init
  fi

  # Validate
  log_info "Validating Terraform configuration..."
  terraform validate

  # Plan
  log_info "Planning infrastructure..."
  echo ""

  if [[ "$APPLY" = true && "$ACTION" = "deploy" ]]; then
    # Auto-apply for demo (usually you'd review first!)
    log_warning "⚡ Auto-apply mode enabled!"
    read -p "Press Enter to apply Terraform plan (or Ctrl+C to cancel)..."

    terraform apply -var-file="terraform.tfvars" -auto-approve $TERRAFORM_FLAGS

    log_success "✅ Infrastructure provisioned!"
    echo ""
    echo "📊 Infrastructure outputs:"
    terraform output -json | jq -r 'to_entries[] | "  \(.key): \(.value.value)"' 2>/dev/null || terraform output

    # Save kubeconfig for later use
    terraform output kubeconfig > kubeconfig 2>/dev/null || true

    echo ""
    log_info "Deploying application with Helm..."

    # Deploy application using Helm
    local helm_charts_dir="$DEPLOY_DIR/../paas/charts"
    cd "$helm_charts_dir"

    # Get cluster info from terraform output
    local alb_url
    alb_url=$(terraform output -raw alb_url 2>/dev/null || echo "pending...")

    # Deploy backend
    helm upgrade --install bizbuddy-backend charts/bizbuddy-backend \
      -n bizbuddy --create-namespace \
      -f ../../values/prod.yaml \
      --set image.tag=production \
      --wait --timeout 10m

    # Deploy frontend
    helm upgrade --install bizbuddy-frontend charts/bizbuddy-frontend \
      -n bizbuddy \
      -f ../../values/prod.yaml \
      --set config.REACT_APP_API_URL=${alb_url:-http://localhost} \
      --wait --timeout 10m

    log_success "🎉 SaaS deployment complete!"
    echo ""
    echo "🌐 Application URL: $alb_url"
    echo "   (If not yet available, check ALB in AWS console)"
    echo ""
    echo "📊 Management commands:"
    echo "   Tear down:     cd $env_dir && terraform destroy"
    echo "   Scale down:    terraform apply -var='cluster_min_size=0'"
    echo "   View outputs:  terraform output"
    echo ""

  else
    # Just plan
    terraform plan -var-file="terraform.tfvars" $TERRAFORM_FLAGS

    if [[ "$APPLY" = false ]]; then
      echo ""
      log_info "Plan only (--no-apply). To apply:"
      echo "  terraform apply -var-file='terraform.tfvars'"
    fi
  fi
}

# ============================================
# Main
# ============================================

# Trap to handle script interruption
trap 'log_error "Deployment interrupted!"; exit 1' INT TERM

# Validate we're in the right directory
if [[ ! -f "$DEPLOY_DIR/README.md" ]]; then
  log_error "deploy/scripts/deploy.sh must be run from BizBuddy project root"
  exit 1
fi

case "$MODEL" in
  iaas)
    deploy_iaas
    ;;
  paas)
    deploy_paas
    ;;
  saas)
    deploy_saas
    ;;
  *)
    log_error "Unknown model: $MODEL"
    usage
    ;;
esac

log_success "✅ Deployment completed successfully!"
