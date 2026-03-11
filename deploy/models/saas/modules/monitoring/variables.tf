variable "aws_region" { type = string }
variable "environment" { type = string }
variable "cluster_name" { type = string }
variable "enable_detailed_monitoring" { type = bool, default = false }
variable "log_retention_days" { type = number, default = 30 }
variable "tags" { type = map(string), default = {} }

output "cloudwatch_dashboard_name" {
  value = aws_cloudwatch_dashboard.main.name
}
