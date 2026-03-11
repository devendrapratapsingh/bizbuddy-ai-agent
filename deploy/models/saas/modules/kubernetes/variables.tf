variable "aws_region" { type = string }
variable "cluster_name" { type = string }
variable "cluster_version" { type = string, default = "1.28" }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "public_subnet_ids" { type = list(string) }
variable "node_instance_type" { type = string, default = "t3.medium" }
variable "cluster_min_size" { type = number, default = 2 }
variable "cluster_max_size" { type = number, default = 5 }
variable "cluster_desired_size" { type = number, default = 2 }
variable "tags" { type = map(string), default = {} }

output "cluster_endpoint" {
  value = aws_eks_cluster.main.endpoint
}
output "cluster_certificate_authority_data" {
  value = aws_eks_cluster.main.certificate_authority[0].data
}
output "cluster_security_group_id" {
  value = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}
output "node_security_group_id" {
  value = aws_eks_node_group.main.node_security_group_id
}
