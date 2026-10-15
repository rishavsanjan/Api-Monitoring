resource "aws_vpc" "api-vpc" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "subnet-1" {
  vpc_id     = aws_vpc.api-vpc.id
  cidr_block = "10.0.1.0/24"

  tags = {
    Name = "api-subnet-1"
  }
}

resource "aws_subnet" "subnet-2" {
  vpc_id     = aws_vpc.api-vpc.id
  cidr_block = "10.0.2.0/24"

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
  description       = "HTTP"
  from_port         = 80
  ip_protocol       = 80
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_security_group" "api-sg-ec2" {
  name   = "api-mobitoring-security-group-ec2"
  vpc_id = aws_vpc.api-vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "api-ec2-rule-1" {
  security_group_id = aws_security_group.api-sg-ec2.id
  description       = "HTTP"
  from_port         = 3000
  ip_protocol       = 3000
  cidr_ipv4         = "0.0.0.0/0"
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
    "Name" = "api-server-1"
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
  protocol          = "HTTPS"

  default_action {
    target_group_arn = aws_lb_target_group.api-tg.arn
    type             = "forward"
  }
}

output "ec2_public_ip_1" {
  value = aws_instance.api-server-1.public_ip
}

output "ec2_public_ip_1" {
  value = aws_instance.api-server-2.public_ip
}


