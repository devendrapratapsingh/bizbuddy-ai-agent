resource "aws_security_group" "redis" {
  name_prefix = "${var.environment}-redis-sg-"
  description = "Security group for ElastiCache Redis"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    security_groups = []
    cidr_blocks = ["10.0.0.0/16"]  # Allow from VPC CIDR
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-redis-sg"
  })
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.environment}-elasticache-subnet-group"
  subnet_ids = var.private_subnet_ids
}

resource "aws_elasticache_parameter_group" "main" {
  name   = "${var.environment}-elasticache-params"
  family = "redis${replace(var.engine_version, ".", "")}"
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id          = "${var.environment}-redis-cluster"
  description                   = "Redis cluster for ${var.environment}"
  node_type                     = var.node_type
  number_cache_clusters         = var.num_cache_nodes
  engine                        = "redis"
  engine_version                = var.engine_version
  parameter_group_name          = aws_elasticache_parameter_group.main.name
  subnet_group_name             = aws_elasticache_subnet_group.main.name
  security_group_ids            = [aws_security_group.redis.id]
  at_rest_encryption_enabled    = true
  transit_encryption_enabled    = true
  auth_token                    = var.redis_password
  multi_az_enabled              = var.num_cache_nodes > 1

  tags = merge(var.tags, {
    Name = "${var.environment}-redis-cluster"
  })
}
