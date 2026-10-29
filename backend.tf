terraform {
  backend "s3" {
    bucket       = "api-monitoring-terraform-state-bucket-rishavsanjan"
    key          = "api-monitoring/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}