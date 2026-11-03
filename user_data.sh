
#!/bin/bash
set -euo pipefail

 
# API Monitoring - EC2 Auto Scaling Bootstrap
 

exec > >(tee -a /var/log/api-monitoring-setup.log) 2>&1

echo "Starting API Monitoring instance setup..."

AWS_REGION="$${aws_region}"
FRONTEND_IMAGE="$${frontend_repo_uri}:$${image_tag}"
BACKEND_IMAGE="$${backend_repo_uri}:$${image_tag}"
SECRET_ARN="$${app_secret_arn}"

 
# Install dependencies
 

apt-get update -y

apt-get install -y \
    docker.io \
    docker-compose-v2 \
    awscli \
    jq \
    curl

 
# 2. Start Docker
 

systemctl enable docker
systemctl start docker

 
#  Authenticate with AWS ECR
 

echo "Logging into ECR..."

ECR_REGISTRY=$$(echo "$$FRONTEND_IMAGE" | cut -d '/' -f 1)

aws ecr get-login-password \
    --region "$$AWS_REGION" |
    docker login \
        --username AWS \
        --password-stdin "$$ECR_REGISTRY"

 
#  Pull Docker images
 

echo "Pulling frontend image..."
docker pull "$$FRONTEND_IMAGE"

echo "Pulling backend image..."
docker pull "$$BACKEND_IMAGE"

 
# Retrieve application secrets
 

echo "Retrieving application secrets..."

SECRET_JSON=$$(aws secretsmanager get-secret-value \
    --secret-id "$$SECRET_ARN" \
    --region "$$AWS_REGION" \
    --query SecretString \
    --output text)

mkdir -p /opt/api-monitoring
cd /opt/api-monitoring

chmod 700 /opt/api-monitoring

# Generate Docker Compose environment file.
# JSON encoding preserves special characters in secret values.
printf 'DATABASE_URL=%s\n' "$$(echo "$$SECRET_JSON" | jq -r '.DATABASE_URL | @json')" > .app.env
printf 'JWT_SECRET=%s\n' "$$(echo "$$SECRET_JSON" | jq -r '.JWT_SECRET | @json')" >> .app.env
printf 'SMTP_USER=%s\n' "$$(echo "$$SECRET_JSON" | jq -r '.SMTP_USER | @json')" >> .app.env
printf 'SMTP_HOST=%s\n' "$$(echo "$$SECRET_JSON" | jq -r '.SMTP_HOST | @json')" >> .app.env
printf 'SMTP_PASS=%s\n' "$$(echo "$$SECRET_JSON" | jq -r '.SMTP_PASS | @json')" >> .app.env
printf 'ENCRYPTION_KEY=%s\n' "$$(echo "$$SECRET_JSON" | jq -r '.ENCRYPTION_KEY | @json')" >> .app.env

chmod 600 .app.env

 
#  Create Docker Compose configuration
 

cat > docker-compose.yml <<'EOF'
services:
  frontend:
    image: api-monitoring-frontend:latest
    build: ./frontend
    ports:
      - "3000:3000"

  backend:
    image: api-monitoring-backend:latest
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: $${DATABASE_URL:?DATABASE_URL is required}
      JWT_SECRET: $${JWT_SECRET:?JWT_SECRET is required}
      SMTP_USER: $${SMTP_USER:?SMTP_USER is required}
      SMTP_HOST: $${SMTP_HOST:?SMTP_HOST is required}
      SMTP_PASS: $${SMTP_PASS:?SMTP_PASS is required}
      ENCRYPTION_KEY: $${ENCRYPTION_KEY:?ENCRYPTION_KEY is required}
EOF

 
# Create Compose image environment
 

cat > .env <<EOF
FRONTEND_IMAGE=$$FRONTEND_IMAGE
BACKEND_IMAGE=$$BACKEND_IMAGE
EOF

# Start application

echo "Starting API Monitoring containers..."

docker compose up -d

# Verify containers

docker compose ps

echo "API Monitoring instance setup completed!"
