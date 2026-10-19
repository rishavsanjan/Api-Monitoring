resource "aws_vpc" "api-vpc" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "subnet-1" {
  vpc_id                  = aws_vpc.api-vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "api-subnet-1"
  }
}

resource "aws_subnet" "subnet-2" {
  vpc_id                  = aws_vpc.api-vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "api-subnet-2"
  }
}

resource "aws_internet_gateway" "api-igw" {
  vpc_id = aws_vpc.api-vpc.id

}

resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.api-vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.api-igw.id
  }

}

resource "aws_route_table_association" "api-rt1" {
  subnet_id      = aws_subnet.subnet-1.id
  route_table_id = aws_route_table.rt.id
}

resource "aws_route_table_association" "api-rt2" {
  subnet_id      = aws_subnet.subnet-2.id
  route_table_id = aws_route_table.rt.id
}

resource "aws_security_group" "api-sg-alb" {
  name   = "api-mobitoring-security-group-alb"
  vpc_id = aws_vpc.api-vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "api-sg-rule-1" {
  security_group_id = aws_security_group.api-sg-alb.id
  description       = "Allow public HTTP traffic"
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "api-alb-egress" {
  security_group_id            = aws_security_group.api-sg-alb.id
  referenced_security_group_id = aws_security_group.api-sg-ec2.id
  from_port                    = 3000
  to_port                      = 3000
  ip_protocol                  = "tcp"
}

resource "aws_security_group" "api-sg-ec2" {
  name   = "api-mobitoring-security-group-ec2"
  vpc_id = aws_vpc.api-vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "api-ec2-rule-1" {
  security_group_id            = aws_security_group.api-sg-ec2.id
  referenced_security_group_id = aws_security_group.api-sg-alb.id
  description                  = "Allow HTTP traffic from ALB"
  from_port                    = 3000
  to_port                      = 3000
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "api-ec2-ssh" {
  security_group_id = aws_security_group.api-sg-ec2.id

  description = "SSH from Jenkins agent"
  from_port   = 22
  to_port     = 22
  ip_protocol = "tcp"
  cidr_ipv4   = "0.0.0.0/0"
}


resource "aws_instance" "api-server-1" {
  ami                    = "ami-0b6d9d3d33ba97d99"
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.api-sg-ec2.id]
  subnet_id              = aws_subnet.subnet-1.id
  key_name               = "vm-key"

  tags = {
    "Name" = "api-server-1"
  }
}

resource "aws_instance" "api-server-2" {
  ami                    = "ami-0b6d9d3d33ba97d99"
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.api-sg-ec2.id]
  subnet_id              = aws_subnet.subnet-2.id
  key_name               = "vm-key"

  tags = {
    "Name" = "api-server-2"
  }
}

resource "aws_lb" "api-load-balancer" {
  name               = "api-monitoring-load-balancer"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.api-sg-alb.id]
  subnets            = [aws_subnet.subnet-1.id, aws_subnet.subnet-2.id]
}

resource "aws_lb_target_group" "api-tg" {
  name     = "api-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.api-vpc.id

  health_check {
    path = "/"
    port = "traffic-port"
  }
}

resource "aws_lb_target_group_attachment" "api-tga-1" {
  target_group_arn = aws_lb_target_group.api-tg.arn
  target_id        = aws_instance.api-server-1.id
  port             = 3000
}

resource "aws_lb_target_group_attachment" "api-tga-2" {
  target_group_arn = aws_lb_target_group.api-tg.arn
  target_id        = aws_instance.api-server-2.id
  port             = 3000
}

resource "aws_lb_listener" "api-lb-listener" {
  load_balancer_arn = aws_lb.api-load-balancer.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_lb_target_group.api-tg.arn
    type             = "forward"
  }
}

resource "aws_ecr_repository" "api-monitoring-ecr-repositry-frontend" {
  name = "api-monitoring-ecr-repositry-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "api-monitoring-ecr-repositry-backend" {
  name = "api-monitoring-ecr-repositry-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

output "ec2_public_ip_1" {
  value = aws_instance.api-server-1.public_ip
}

output "ec2_public_ip_2" {
  value = aws_instance.api-server-2.public_ip
}

output "load_balancer_dns" {
  value = aws_lb.api-load-balancer.dns_name
}

output "ecr_frontend_repo_uri" {
  value = aws_ecr_repository.api-monitoring-ecr-repositry-frontend.uri
}

output "ecr_backend_repo_uri" {
  value = aws_ecr_repository.api-monitoring-ecr-repositry-backend.uri
}


