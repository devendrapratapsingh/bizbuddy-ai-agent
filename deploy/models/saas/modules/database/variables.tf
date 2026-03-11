variable "aws_region" { type = string }
variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "db_name" { type = string }
variable "db_username" { type = string }
variable "db_password" { type = string, sensitive = true }
variable "db_instance_class" { type = string, default = "db.t3.medium" }
variable "db_storage_size" { type = number, default = 20 }
variable "db_multi_az" { type = bool, default = false }
variable "tags" { type = map(string), default = {} }

output "db_endpoint" {
  value = aws_db_instance.main.endpoint
}
output "db_port" {
  value = aws_db_instance.main.port
}
