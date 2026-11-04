resource "aws_autoscaling_group" "api_asg" {
  name = "api-monitoring-asg"

  min_size         = 2
  desired_capacity = 2
  max_size         = 4

  vpc_zone_identifier = [
    aws_subnet.subnet-1.id,
    aws_subnet.subnet-2.id
  ]

  target_group_arns = [
    aws_lb_target_group.api-tg.arn,
    aws_lb_target_group.backend-tg.arn
  ]

  health_check_type         = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.api_launch_template.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "api-monitoring-asg-instance"
    propagate_at_launch = true
  }
}