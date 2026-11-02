output "autoscaling_group_name" {
  value = aws_autoscaling_group.api_asg.name
}

output "load_balancer_dns" {
  value = aws_lb.api-load-balancer.dns_name
}

output "ecr_frontend_repo_uri" {
  value = aws_ecr_repository.api-monitoring-ecr-repositry-frontend.repository_url
}

output "ecr_backend_repo_uri" {
  value = aws_ecr_repository.api-monitoring-ecr-repositry-backend.repository_url
}