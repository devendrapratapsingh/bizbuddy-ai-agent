variable "aws_region" { type = string }
variable "environment" { type = string }
variable "cluster_name" { type = string }
variable "vpc_id" { type = string }
variable "public_subnet_ids" { type = list(string) }
variable "domain" { type = string }
variable "ssl_cert_arn" { type = string, default = "" }
variable "create_cert" { type = bool, default = false }

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}
output "alb_zone_id" {
  value = aws_lb.main.zone_id
}
