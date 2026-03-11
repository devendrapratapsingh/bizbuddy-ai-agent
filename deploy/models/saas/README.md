# SaaS Deployment Model - Cloud Native

## Overview

The SaaS (Software as a Service) model uses Terraform to provision production-grade cloud infrastructure. This is designed for:

- Production deployments on AWS/GCP/Azure
- High availability and autoscaling requirements
- Multi-region deployments
- Enterprise-grade monitoring and security
- Cost-optimized infrastructure

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloud Provider (AWS/GCP/Azure)           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Load Balancer (ALB/NLB)                │   │
│  │              (Cloud-native LB + SSL)               │   │
│  └────────────────┬────────────────────────────────────┘   │
│                   │                                        │
│  ┌────────────────┴────────────────────────────────────┐   │
│  │        Managed Kubernetes (EKS/GKE/AKS)            │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  │   │
│  │  │ Frontend   │  │   Backend  │  │   Redis    │  │   │
│  │  │  Pods      │  │   Pods     │  │  Cluster   │  │   │
│  │  └────────────┘  └────────────┘  └────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                               │                              │
│  ┌────────────────────────────┼─────────────────────┐      │
│  │                            │                     │      │
│  │  ┌────────────┐  ┌────────▼────────┐  ┌────────▼─────┐│
│  │  │   RDS      │  │   ElastiCache   │  │    S3        ││
│  │  │ PostgreSQL │  │    (Redis)      │  │  (Uploads)   ││
│  │  │  (Multi-AZ)│  │   (Cluster)     │  │ (CDN Ready)  ││
│  │  └────────────┘  └─────────────────┘  └──────────────┘│
│  │                                                         │
│  │  ┌─────────────────────────────────────────────┐      │
│  │  │   CloudWatch / Cloud Monitoring             │      │
│  │  │   VPC Flow Logs                            │      │
│  │  │   AWS X-Ray / Cloud Trace                  │      │
│  │  └─────────────────────────────────────────────┘      │
│  └────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

### Cloud Provider Account

Choose one:
- **AWS:** aws CLI configured with credentials
- **GCP:** gcloud CLI with project set
- **Azure:** az CLI with subscription

### Terraform

```bash
# Install Terraform
brew install terraform  # macOS
# Or download from https://terraform.io/downloads

# Verify
terraform version
```

### kubectl configured

Terraform will create the cluster and configure kubectl automatically.

### Domain & SSL

- Domain name (e.g., `bizbuddy.com`)
- Route 53 / Cloud DNS zone (for AWS/GCP)
- Or use external DNS provider

## 🚀 Quick Start

### 1. Choose Cloud Provider

Currently, this directory structure supports **AWS** first-class. For GCP or Azure, adapt module providers.

### 2. Configure Environment

```bash
cd deploy/models/saas/environments/dev

# Copy example variables
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your configuration:
# - AWS region
# - Domain name
# - Database password
# - JWT secret
# - OpenAI API key
# - etc.
```

Required variables (minimum):
```hcl
aws_region      = "us-east-1"
environment     = "dev"
domain          = "dev.bizbuddy.com"
db_password     = "your-secure-db-password"
jwt_secret      = "your-super-secret-jwt-key"
openai_api_key  = "sk-..."
```

### 3. Initialize Terraform

```bash
cd deploy/models/saas/environments/dev

# Initialize Terraform (downloads providers)
terraform init

# Validate configuration
terraform validate

# Plan infrastructure
terraform plan -var-file="terraform.tfvars"
```

Review the plan carefully! It will create:
- VPC with public/private subnets
- EKS cluster with node groups
- RDS PostgreSQL database
- ElastiCache Redis cluster
- S3 buckets (uploads, Terraform state)
- Load balancer (ALB) with SSL certificate
- IAM roles and policies
- Security groups and network ACLs

### 4. Apply Infrastructure

```bash
# Apply (will create all resources)
terraform apply -var-file="terraform.tfvars" -auto-approve

# OR for interactive confirmation (recommended for first time)
terraform apply -var-file="terraform.tfvars"
```

**Duration:** ~15-30 minutes

### 5. Deploy Application with Helm

Terraform will output kubeconfig and connection info:

```bash
# Get kubeconfig from Terraform output
terraform output kubeconfig > kubeconfig
export KUBECONFIG=$(pwd)/kubeconfig

# Verify cluster access
kubectl get nodes

# Deploy backend
cd ../../..
helm install bizbuddy-backend charts/bizbuddy-backend \
  -f values/prod.yaml \
  --namespace bizbuddy \
  --create-namespace \
  --set image.repository=your-registry/bizbuddy-backend \
  --set image.tag=production \
  --wait --timeout 10m

# Deploy frontend
helm install bizbuddy-frontend charts/bizbuddy-frontend \
  -f values/prod.yaml \
  --namespace bizbuddy \
  --set config.REACT_APP_API_URL=https://api.bizbuddy.com \
  --wait --timeout 10m
```

### 6. Access Application

```bash
# Get load balancer URL
terraform output alb_url
# or
kubectl get ingress -n bizbuddy

# Should output: https://api.bizbuddy.com
# Open in browser and test!

# Test health
curl https://api.bizbuddy.com/health
```

## 📊 Monitoring

### CloudWatch (AWS)

Terraform creates CloudWatch dashboards and alarms:
- CPU/Memory utilization
- Request latency
- Error rates
- Database connections
- Cache hit rate

Access via AWS Console → CloudWatch → Dashboards

### Grafana Stack (Optional)

If you deployed monitoring stack:

```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace bizbuddy-monitoring \
  --create-namespace

# Access Grafana (port-forward)
kubectl port-forward svc/prometheus-grafana 3000:80 -n bizbuddy-monitoring
```

## 🔄 Updates & Rollbacks

### Infrastructure Updates

```bash
cd deploy/models/saas/environments/prod

# After changing Terraform code or variables
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

### Application Updates

```bash
export KUBECONFIG=environments/prod/kubeconfig

# Build and push new image
docker build -t your-registry/bizbuddy-backend:v2.0 .
docker push your-registry/bizbuddy-backend:v2.0

# Upgrade Helm release
helm upgrade bizbuddy-backend ../../charts/bizbuddy-backend \
  -f ../../values/prod.yaml \
  --set image.tag=v2.0 \
  --wait \
  -n bizbuddy

# Monitor rollout
kubectl rollout status deployment/bizbuddy-backend -n bizbuddy
```

### Rollback Application

```bash
helm rollback bizbuddy-backend -n bizbuddy
helm history bizbuddy-backend -n bizbuddy
```

### Destroy Infrastructure

⚠️ **WARNING:** This will delete ALL resources!

```bash
terraform destroy -var-file="terraform.tfvars"
```

To preserve database:
1. Create snapshot manually
2. Comment out database module in main.tf
3. Run terraform apply
4. Then destroy

## 🧹 Cleanup Demo

For quick demo teardown (without destroying database):

```bash
# Delete application releases
helm uninstall bizbuddy-backend -n bizbuddy
helm uninstall bizbuddy-frontend -n bizbuddy

# Scale down cluster (save costs)
terraform apply -var-file="terraform.tfvars" -var="cluster_min_size=0" -var="cluster_max_size=0"
```

## 📋 Multi-Region (Advanced)

For multi-region deployment, create separate Terraform workspaces:

```bash
cd deploy/models/saas/environments
terraform workspace new us-east-1
terraform workspace new us-west-2
```

Use data sources to share resources (Route53, CloudFront) across regions.

## 🔐 Security Considerations

### IAM Roles

Terraform creates least-privilege IAM roles:
- EKS node role (EC2 instances)
- EKS cluster role (control plane)
- Fargate profiles (if used)

### Network Security

- Resources deployed in private subnets (except ALB)
- Security groups restrict traffic
- Database not publicly accessible
- Redis in private subnet only

### Secrets Management

**DO NOT** commit secrets to Git! Use:
- Terraform variables file (git-ignored)
- Environment variables
- AWS Secrets Manager / Parameter Store

### Encryption

- RDS encryption at rest
- EBS volumes encrypted
- S3 bucket encryption
- TLS for load balancer

## 💰 Cost Optimization

### Reserved Instances / Savings Plans

For production, commit to 1-year or 3-year terms:
- EC2 instances (node groups)
- RDS database
- Savings Plans for Kubernetes

### Auto-scaling

Right-size min/max replicas based on load:
- Set `cluster_min_size` and `cluster_max_size`
- Enable HPA in Helm values
- Enable cluster autoscaling

### Scheduled Scaling

For predictable load patterns:

```hcl
resource "aws_autoscaling_schedule" "scale_down_night" {
  scheduled_action_name  = "scale-down-night"
  min_size              = 2
  max_size              = 2
  desired_capacity      = 2
  recurrence            = "0 20 * * *"  # 8 PM UTC daily
}
```

### Cleanup Resources

When not in use for demo:
```bash
terraform apply -var="cluster_min_size=0"  # Scale nodes to 0
terraform apply -var="db_instance_class=db.t3.micro"  # Smaller DB
```

## 🤝 Contributing

To add support for other cloud providers:

1. Create `providers/gcp/` or `providers/azure/` modules
2. Mirror AWS modules with GCP/Azure equivalents
3. Use `terraform workspace` for multi-cloud strategy
4. Document provider-specific prerequisites

---

**Last Updated:** 2025-03-11
**Status:** ✅ Production Ready (after IaC review)
**Cloud Provider:** AWS (primary)
**Terraform Version:** 1.0+
