variable "aws_region" { type = string }
variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "redis_password" { type = string, sensitive = true }
variable "node_type" { type = string, default = "cache.t3.micro" }
variable "num_cache_nodes" { type = number, default = 1 }
variable "engine_version" { type = string, default = "7.1" }
variable "tags" { type = map(string), default = {} }

output "redis_endpoint" {
  value = aws_elasticache_replication_group.main.configuration_endpoint_address
}
output "redis_port" {
  value = aws_elasticache_replication_group.main.port
}
