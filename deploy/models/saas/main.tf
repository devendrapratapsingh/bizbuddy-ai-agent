terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.14"
    }
  }
}

# Configure AWS provider
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "BizBuddy"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Generate random suffix for resource names
resource "random_id" "suffix" {
  byte_length = 4
}

# locals for consistent naming
locals {
  suffix            = random_id.suffix.hex
  cluster_name      = "bizbuddy-${var.environment}-${local.suffix}"
  db_name           = "bizbuddy_${var.environment}"
  redis_name        = "bizbuddy-redis-${var.environment}"
  s3_bucket_name    = "bizbuddy-uploads-${var.environment}-${local.suffix}"
  tfstate_bucket    = "bizbuddy-tfstate-${var.aws_region}"
}

# Module: Networking (VPC, Subnets, NAT, Security Groups)
module "networking" {
  source = "./modules/networking"

  aws_region     = var.aws_region
  environment    = var.environment
  cluster_name   = local.cluster_name
  vpc_cidr       = var.vpc_cidr
  azs            = var.availability_zones
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets

  tags = {
    Environment = var.environment
  }
}

# Module: Kubernetes Cluster (EKS)
module "kubernetes" {
  source = "./modules/kubernetes"

  aws_region          = var.aws_region
  cluster_name        = local.cluster_name
  cluster_version     = var.kubernetes_version
  vpc_id              = module.networking.vpc_id
  private_subnet_ids  = module.networking.private_subnet_ids
  public_subnet_ids   = module.networking.public_subnet_ids
  node_instance_type  = var.node_instance_type
  cluster_min_size    = var.cluster_min_size
  cluster_max_size    = var.cluster_max_size
  cluster_desired_size = var.cluster_desired_size

  tags = {
    Environment = var.environment
  }

  depends_on = [
    module.networking
  ]
}

# Module: PostgreSQL Database (RDS)
module "database" {
  source = "./modules/database"

  aws_region       = var.aws_region
  environment      = var.environment
  vpc_id           = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  db_name          = local.db_name
  db_username      = var.db_username
  db_password      = var.db_password
  db_instance_class = var.db_instance_class
  db_storage_size  = var.db_storage_size
  multi_az         = var.db_multi_az

  tags = {
    Environment = var.environment
  }

  depends_on = [
    module.networking
  ]
}

# Module: Redis Cache (ElastiCache)
module "cache" {
  source = "./modules/cache"

  aws_region       = var.aws_region
  environment      = var.environment
  vpc_id           = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  redis_password   = var.redis_password
  node_type        = var.redis_node_type
  num_cache_nodes  = var.redis_num_nodes
  engine_version   = var.redis_version

  tags = {
    Environment = var.environment
  }

  depends_on = [
    module.networking
  ]
}

# Module: Object Storage (S3)
module "storage" {
  source = "./modules/storage"

  aws_region   = var.aws_region
  environment  = var.environment
  bucket_name  = local.s3_bucket_name

  tags = {
    Environment = var.environment
  }
}

# Module: Ingress & Load Balancer
module "ingress" {
  source = "./modules/ingress"

  aws_region    = var.aws_region
  environment   = var.environment
  cluster_name  = local.cluster_name
  vpc_id        = module.networking.vpc_id
  public_subnet_ids = module.networking.public_subnet_ids
  domain        = var.domain
  ssl_cert_arn  = var.ssl_cert_arn  # ACM certificate ARN
  create_cert   = var.create_letsencrypt_cert

  tags = {
    Environment = var.environment
  }

  depends_on = [
    module.kubernetes
  ]
}

# Module: Monitoring & Logging
module "monitoring" {
  source = "./modules/monitoring"

  aws_region  = var.aws_region
  environment = var.environment
  cluster_name = local.cluster_name

  enable_detailed_monitoring = var.enable_detailed_monitoring
  log_retention_days         = var.log_retention_days

  tags = {
    Environment = var.environment
  }

  depends_on = [
    module.kubernetes
  ]
}

# Output important connection details
output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.kubernetes.cluster_endpoint
}

output "kubeconfig" {
  description = "kubectl configuration for the cluster"
  value = yamlencode({
    apiVersion = "v1"
    kind       = "Config"
    clusters = [{
      name    = local.cluster_name
      cluster = {
        server                   = module.kubernetes.cluster_endpoint
        certificate_authority_data = module.kubernetes.cluster_certificate_authority_data
      }
    }]
    contexts = [{
      name    = "aws-${var.aws_region}"
      context = {
        cluster = local.cluster_name
        user    = "aws"
      }
    }]
    current-context = "aws-${var.aws_region}"
    users = [{
      name = "aws"
      user = {
        exec = {
          api_version = "client.authentication.k8s.io/v1alpha1"
          command      = "aws"
          args        = ["eks", "get-token", "--cluster-name", local.cluster_name, "--region", var.aws_region]
        }
      }
    }]
  })
  sensitive = true
}

output "database_url" {
  description = "PostgreSQL connection URL"
  value       = "postgresql://${var.db_username}:${var.db_password}@${module.database.db_endpoint}:5432/${local.db_name}?sslmode=require"
  sensitive   = true
}

output "redis_url" {
  description = "Redis connection URL"
  value       = "rediss://:${var.redis_password}@${module.cache.redis_endpoint}:6379"
  sensitive   = true
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.ingress.alb_dns_name
}

output "alb_url" {
  description = "Application Load Balancer URL"
  value       = "https://${module.ingress.alb_dns_name}"
}

output "s3_bucket_name" {
  description = "S3 bucket for file uploads"
  value       = module.storage.bucket_name
}

output "cloudwatch_dashboard_url" {
  description = "CloudWatch dashboard URL"
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${local.cluster_name}-dashboard"
}
