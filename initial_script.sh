#!/bin/bash

apt update
apt install -y docker.io
apt install -y awscli

systemctl enable docker
systemctl start docker

usermod -aG docker ubuntu