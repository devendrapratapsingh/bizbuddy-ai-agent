# Deployment Models

This directory contains all deployment configurations for BizBuddy AI Agent across three deployment models:

## 📁 Structure

```
deploy/
├── models/              # Deployment pattern configurations
│   ├── iaas/            # Docker Compose (Infrastructure as a Service)
│   ├── paas/            # Kubernetes with Helm (Platform as a Service)
│   └── saas/            # Terraform cloud modules (Software as a Service)
├── scripts/             # Deployment orchestration scripts
│   ├── deploy.sh       # Unified deployment wrapper
│   ├── iaas-deploy.sh  # IaaS-specific deployment
│   ├── paas-deploy.sh  # PaaS-specific deployment
│   └── saas-deploy.sh  # SaaS-specific deployment
└── README.md           # This file - comprehensive deployment guide
```

## 🎯 Deployment Models

### IaaS (Docker Compose)
**Pattern:** Infrastructure as a Service - containers on a single host

**Use when:**
- Local development and testing
- Small teams or Proof of Concept
- No Kubernetes cluster available
- Quick demos and prototyping

**Tech stack:**
- Docker Compose for orchestration
- Docker volumes for persistence
- Bridge networking
- PM2 process manager

**Benefits:**
- ✅ Simplest to understand and deploy
- ✅ Fastest to set up (~5 minutes)
- ✅ No external dependencies
- ✅ Good for development

**Limitations:**
- ❌ Single point of failure
- ❌ Limited scalability
- ❌ No service discovery mesh
- ❌ Manual updates/rollbacks

[See details →](models/iaas/README.md)

### PaaS (Kubernetes)
**Pattern:** Platform as a Service - container orchestration with declarative deployment

**Use when:**
- Production-like environment locally
- Need orchestration features (scaling, self-healing)
- Want to practice GitOps and Helm
- Testing Kubernetes manifests before cloud

**Tech stack:**
- k3s (local Kubernetes)
- Helm for package management
- NGINX Ingress for routing
- MetalLB for load balancing

**Benefits:**
- ✅ Industry-standard Kubernetes
- ✅ Declarative deployment model
- ✅ Service discovery and load balancing
- ✅ Health checks and auto-restart
- ✅ Same manifests as cloud (EKS/GKE/AKS)

**Limitations:**
- ❌ Steeper learning curve
- ❌ More complex setup (~10 minutes)
- ❌ Higher resource requirements

[See details →](models/paas/README.md)

### SaaS (Cloud Native)
**Pattern:** Software as a Service - production cloud infrastructure

**Use when:**
- Deploying to production
- Need high availability and autoscaling
- Multi-region deployment
- Enterprise-grade monitoring and security

**Tech stack:**
- Terraform for infrastructure as code
- AWS/GCP/Azure cloud providers
- Managed Kubernetes (EKS/GKE/AKS)
- Managed databases (RDS/CloudSQL)
- Load balancers and CDNs

**Benefits:**
- ✅ Production-ready
- ✅ High availability and fault tolerance
- ✅ Auto-scaling and load balancing
- ✅ Managed services reduce operational overhead
- ✅ Multi-region capability
- ✅ Infrastructure as code (versioned, reproducible)

**Limitations:**
- ❌ Highest complexity
- ❌ Cloud costs ($$$)
- ❌ Requires cloud provider accounts
- ❌ Longer setup time (~20 minutes)

[See details →](models/saas/README.md)

## 🔄 Choosing a Deployment Model

| Scenario | Recommended Model | Why |
|----------|------------------|-----|
| Development | IaaS (Docker Compose) | Fast, simple, easy to debug |
| Staging / Demo | PaaS (k3s Kubernetes) | Production-like, no cloud costs |
| Production | SaaS (Cloud Terraform) | HA, autoscaling, managed services |
| Learning | Start with IaaS, then PaaS, then SaaS | Progressive complexity |
| Limited Resources | IaaS only | Minimal RAM/CPU requirements |
| Kubernetes Skills | PaaS or SaaS | Leverage your K8s expertise |

## 🚀 Quick Start

### One-command deployment (after setup):

```bash
# IaaS - Docker Compose
./deploy.sh --model=iaas --env=dev

# PaaS - Kubernetes
./deploy.sh --model=paas --env=dev

# SaaS - Cloud (requires cloud credentials)
./deploy.sh --model=saas --env=prod --apply
```

### Demo scripts:

```bash
# Complete walkthrough of all models
./scripts/demo/01-iaas.sh      # Docker Compose demo
./scripts/demo/02-paas.sh      # k3s Kubernetes demo
./scripts/demo/03-saas.sh      # Terraform plan (dry-run)
./scripts/demo/04-cicd.sh      # CI/CD pipeline demo
```

## 📊 Comparison Matrix

| Feature | IaaS | PaaS | SaaS |
|---------|------|------|------|
| **Orchestration** | Docker Compose | Kubernetes (k3s) | Cloud K8s (EKS/GKE) |
| **Setup Time** | ~5 min | ~10 min | ~20 min |
| **Resource Use** | Low (1GB) | Medium (2GB) | High (cloud) |
| **Scalability** | Manual | Auto (HPA) | Auto (cluster autoscaler) |
| **High Availability** | No | Partial | Full |
| **Load Balancing** | Host ports | Ingress + MetalLB | Cloud LB (ALB/NLB) |
| **Service Discovery** | Docker DNS | K8s Services | Cloud load balancer |
| **Secrets Mgmt** | .env files | K8s Secrets | Cloud Secrets Manager |
| **Storage** | Local volumes | PersistentVolumeClaims | Cloud Storage (S3) |
| **Monitoring** | Docker logs | Prometheus + Grafana | CloudWatch + managed |
| **CI/CD** | Scripts | Helm + GitHub Actions | Terraform + Helm |
| **Cost** | Free | Free (local) | Pay-as-you-go ($$$) |
| **Production Ready** | No | Maybe | ✅ Yes |

## 🛠️ Prerequisites

### Common (all models)
- Node.js 18+
- Docker (for IaaS and building images)
- Git

### IaaS-specific
- Docker Compose v2.2+

### PaaS-specific
- k3s (installed by `infra/k3s-setup.sh`)
- kubectl
- Helm 3+
- (optional) k9s for TUI

### SaaS-specific
- Terraform 1.0+
- Cloud provider CLI (aws/gcloud/azure)
- Cloud provider account with billing enabled
- kubectl configured for cloud cluster

## 📚 Documentation

- **[Multi-tenancy Architecture](models/paas/MULTI_TENANCY.md)** - How SaaS isolation works
- **[GitOps Workflow](models/paas/GITOPS.md)** - CI/CD pipeline explanation
- **[Configuration Management](CONFIG_MANAGEMENT.md)** - How configs are loaded
- **[Monitoring Setup](MONITORING.md)** - Observability across models
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions

## 🔧 Need Help?

1. Check the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide
2. Review model-specific READMEs in `models/iaas/`, `models/paas/`, `models/saas/`
3. Check application logs:
   - IaaS: `docker-compose logs -f`
   - PaaS: `kubectl logs -f <pod> -n bizbuddy`
   - SaaS: Cloud provider console
4. Open an issue on GitHub

## 🤝 Contributing

Found a bug or want to improve deployment? See [CONTRIBUTING.md](../../CONTRIBUTING.md) in the root.

---

**Last Updated:** 2025-03-11
**Maintainer:** DevOps Team
**Status:** ✅ Production Ready (after full implementation)
