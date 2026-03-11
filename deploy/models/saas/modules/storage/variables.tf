variable "aws_region" { type = string }
variable "environment" { type = string }
variable "bucket_name" { type = string }

output "bucket_name" {
  value = aws_s3_bucket.main.bucket
}
