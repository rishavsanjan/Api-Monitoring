#!/bin/bash

set -Eeuo pipefail

 
# API Monitoring - EC2 Auto Scaling Bootstrap
 

LOG_FILE="/var/log/api-monitoring-setup.log"

exec > >(tee -a "$LOG_FILE") 2>&1

trap 'echo "ERROR: Bootstrap failed at line $LINENO. Exit code: $?"' ERR

echo "=========================================="
echo "Starting API Monitoring EC2 setup"
echo "=========================================="

 
# 1. Terraform-provided configuration
 

AWS_REGION="${aws_region}"

FRONTEND_IMAGE="${frontend_repo_uri}:${image_tag}"
BACKEND_IMAGE="${backend_repo_uri}:${image_tag}"

SECRET_ARN="${app_secret_arn}"

echo "AWS Region: $AWS_REGION"
echo "Frontend Image: $FRONTEND_IMAGE"
echo "Backend Image: $BACKEND_IMAGE"

if [ -z "$AWS_REGION" ] || \
   [ -z "$SECRET_ARN" ] || \
   [ -z "$FRONTEND_IMAGE" ] || \
   [ -z "$BACKEND_IMAGE" ]; then
    echo "ERROR: Required configuration is missing."
    exit 1
fi

 
# 2. Install dependencies
 

echo "Updating Ubuntu packages..."

apt-get update -y

echo "Installing Docker, Compose, AWS CLI and utilities..."

apt-get install -y \
    docker.io \
    docker-compose-v2 \
    awscli \
    jq \
    curl \
    ca-certificates \
    python3

 
# 3. Start Docker
 

echo "Starting Docker..."

systemctl enable docker
systemctl start docker

docker --version
docker compose version

 
# 4. Authenticate with Amazon ECR
 

echo "Logging into Amazon ECR..."

ECR_REGISTRY=$(echo "$FRONTEND_IMAGE" | cut -d '/' -f 1)

aws ecr get-login-password \
    --region "$AWS_REGION" |
    docker login \
        --username AWS \
        --password-stdin "$ECR_REGISTRY"

echo "ECR authentication successful."

 
# 5. Pull application images
 

echo "Pulling frontend image..."

docker pull "$FRONTEND_IMAGE"

echo "Pulling backend image..."

docker pull "$BACKEND_IMAGE"

echo "Docker images downloaded successfully."

 
# 6. Retrieve application secrets
 

echo "Retrieving application secrets from AWS Secrets Manager..."

SECRET_JSON=$(aws secretsmanager get-secret-value \
    --secret-id "$SECRET_ARN" \
    --region "$AWS_REGION" \
    --query SecretString \
    --output text)

 
# 7. Create application directory
 

APP_DIR="/opt/api-monitoring"

mkdir -p "$APP_DIR"

chmod 700 "$APP_DIR"

cd "$APP_DIR"

 
# 8. Generate application environment file
 

echo "Generating application environment file..."

printf '%s' "$SECRET_JSON" > secrets.json

chmod 600 secrets.json

python3 - <<'PY'
import json

with open("secrets.json", "r") as file:
    secrets = json.load(file)

required_keys = [
    "DATABASE_URL",
    "JWT_SECRET",
    "SMTP_USER",
    "SMTP_HOST",
    "SMTP_PASS",
    "ENCRYPTION_KEY"
]

with open(".app.env", "w") as file:
    for key in required_keys:
        if key not in secrets or secrets[key] is None:
            raise ValueError(f"Missing required secret: {key}")

        # Docker Compose dotenv supports single-quoted
        # values and escaped single quotes.
        value = str(secrets[key])
        value = value.replace("\\", "\\\\")
        value = value.replace("'", "\\'")

        file.write(f"{key}='{value}'\n")

print("Application environment file generated.")
PY

rm -f secrets.json

chmod 600 .app.env

 
# 9. Create Docker Compose environment configuration
 

cat > .env <<EOF
FRONTEND_IMAGE=$FRONTEND_IMAGE
BACKEND_IMAGE=$BACKEND_IMAGE
EOF

chmod 600 .env

 
# 10. Create Docker Compose configuration
 

echo "Creating Docker Compose configuration..."

cat > docker-compose.yml <<'EOF'
services:

  frontend:
    image: $${FRONTEND_IMAGE}
    container_name: api-monitoring-frontend
    restart: unless-stopped

    ports:
      - "3000:3000"

    depends_on:
      - backend

  backend:
    image: $${BACKEND_IMAGE}
    container_name: api-monitoring-backend
    restart: unless-stopped

    ports:
        - "5000:5000"

    env_file:
      - .app.env
EOF

 
# 11. Validate Docker Compose configuration
 

echo "Validating Docker Compose configuration..."

docker compose config --quiet

 
# 12. Start application containers
 

echo "Starting API Monitoring containers..."

docker compose pull

docker compose up -d --remove-orphans

 
# 13. Verify containers
 

echo "Checking running containers..."

docker compose ps

 
# 14. Verify frontend health
 

echo "Waiting for frontend to become available..."

FRONTEND_READY=false

for attempt in $(seq 1 60); do

    if curl -fsS http://localhost:3000/ -o /dev/null; then
        FRONTEND_READY=true
        break
    fi

    echo "Frontend not ready yet. Attempt: $attempt/60"

    sleep 5

done

if [ "$FRONTEND_READY" != "true" ]; then
    echo "ERROR: Frontend did not become available."

    docker compose ps

    docker compose logs --tail=100

    exit 1
fi

 
# 15. Setup completed

echo "=========================================="
echo "API Monitoring setup completed!"
echo "Frontend is responding on port 3000."
echo "Backend is available internally on port 5000."
echo "=========================================="
