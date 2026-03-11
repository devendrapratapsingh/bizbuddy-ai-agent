#!/bin/bash

# Demo 3: SaaS Deployment with Terraform (Plan Only)
# This script demonstrates Infrastructure as Code for cloud deployment

set -e

cd "$(dirname "$0")/../.."

echo "=========================================="
echo "🎯 DEMO 3: SaaS Deployment (Terraform)"
echo "=========================================="
echo ""
echo "This demonstrates the Software-as-a-Service pattern:"
echo "  • Infrastructure as Code (IaC) with Terraform"
echo "  • Multi-cloud capable (AWS, GCP, Azure)"
echo "  • Production-grade HA architecture"
echo "  • Fully automated cloud provisioning"
echo ""
echo "⚠️  NOTE: This demo will only PLAN, not APPLY."
echo "   Real cloud deployment requires:"
echo "   - AWS/GCP/Azure account with billing"
echo "   - Terraform state storage (S3)"
echo "   - Proper credentials configured"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v terraform &> /dev/null; then
  echo "❌ Terraform not found. Install from: https://terraform.io/downloads"
  exit 1
fi

echo "✅ Terraform: $(terraform version | head -1)"
echo ""

# Show directory structure
echo "🏗️  Terraform Structure:"
tree -L 2 deploy/models/saas 2>/dev/null || find deploy/models/saas -type d -maxdepth 2 | head -20
echo ""

# Choose environment
echo "Select environment to demonstrate:"
echo "  1) Dev (minimal resources - for testing)"
echo "  2) Staging (production-like, smaller scale)"
echo "  3) Prod (full HA, production-grade)"
echo ""
read -p "Enter choice [1-3]: " env_choice

case "$env_choice" in
  1) ENVIRONMENT="dev" ;;
  2) ENVIRONMENT="staging" ;;
  3) ENVIRONMENT="prod" ;;
  *) echo "Invalid choice. Using 'dev'."; ENVIRONMENT="dev" ;;
esac

echo ""
echo "📁 Selected environment: $ENVIRONMENT"
echo ""

# Navigate to environment
env_dir="deploy/models/saas/environments/$ENVIRONMENT"
cd "$env_dir"

# Check for terraform.tfvars
if [[ ! -f "terraform.tfvars" ]]; then
  echo "⚠️  terraform.tfvars not found."
  if [[ -f "terraform.tfvars.example" ]]; then
    echo "📋 Creating from example template..."
    cp terraform.tfvars.example terraform.tfvars
    echo ""
    echo "⚠️  You should edit terraform.tfvars with your configuration:"
    echo "   - Set aws_region (or other cloud provider)"
    echo "   - Set secure passwords"
    echo "   - Configure domain name"
    echo ""
    read -p "Press Enter to continue with plan (or Ctrl+C to edit first)..."
  else
    echo "❌ No terraform.tfvars.example found. Please create terraform.tfvars manually."
    exit 1
  fi
fi

# Initialize Terraform
echo "🔧 Initializing Terraform..."
echo ""
terraform init -upgrade -backend=false 2>&1 | grep -E '(Initializing|Terraform|Providers|Backend|Successfully)' || terraform init 2>&1 | tail -10
echo ""

# Validate
echo "🔍 Validating configuration..."
terraform validate
echo ""

# Plan
echo "🗺️  Planning infrastructure..."
echo ""
echo "This will create:"
echo "  • VPC with public/private subnets"
echo "  • EKS/GKE Kubernetes cluster"
echo "  • RDS PostgreSQL database"
echo "  • ElastiCache Redis cluster"
echo "  • S3 bucket for uploads"
echo "  • Application Load Balancer (with SSL)"
echo "  • CloudWatch monitoring"
echo "  • IAM roles and security groups"
echo ""
echo "💸 Estimated cost: ~$50-200/month (depending on region and options)"
echo ""
echo "Press Enter to view plan..."
read

terraform plan -var-file="terraform.tfvars" "$@"
plan_exit=$?

echo ""
if [[ $plan_exit -eq 0 ]]; then
  echo "=========================================="
  echo "✅ SaaS PLAN COMPLETE"
  echo "=========================================="
  echo ""
  echo "📊 Plan Summary:"
  echo "   See above output for resource count and changes"
  echo ""
  echo "🚀 To actually deploy (requires AWS account):"
  echo "   cd $PWD"
  echo "   terraform apply -var-file='terraform.tfvars'"
  echo ""
  echo "🗑️  To destroy:"
  echo "   terraform destroy -var-file='terraform.tfvars'"
  echo ""
  echo "💡 This SaaS model demonstrates:"
  echo "   • Cloud-agnostic Infrastructure as Code"
  echo "   • Production-grade HA architecture"
  echo "   • Separate networking, compute, storage layers"
echo "   • Managed services (RDS, ElastiCache, EKS)"
  echo "   • Scalable, secure, monitored infrastructure"
  echo ""
  echo "🎉 You have successfully seen all three deployment models!"
  echo ""
  echo "Summary:"
  echo "  ✅ IaaS  - Docker Compose (fast, simple)"
  echo "  ✅ PaaS  - Kubernetes (orchestrated, portable)"
  echo "  ✅ SaaS  - Terraform (cloud-native, HA)"
  echo ""
else
  echo "❌ Terraform plan failed with exit code $plan_exit"
  echo "   Check the error messages above."
  exit 1
fi
