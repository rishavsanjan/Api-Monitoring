
pipeline {
    agent any

    tools {
        nodejs 'nodejs'
        go 'go'
    }

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/rishavsanjan/api-monitoring'
            }
        }

        stage('Build services') {
            parallel {
                stage('Build frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }

                stage('Build backend') {
                    steps {
                        dir('backend') {
                            sh 'go mod download'
                            sh 'go test ./...'
                        }
                    }
                }
            }
        }

        
        stage('Docker image build') {
            steps {
                withCredentials([
                    string(credentialsId: 'DATABASE_URL', variable: 'DATABASE_URL'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'SMTP_USER', variable: 'SMTP_USER'),
                    string(credentialsId: 'SMTP_HOST', variable: 'SMTP_HOST'),
                    string(credentialsId: 'SMTP_PASS', variable: 'SMTP_PASS'),
                    string(credentialsId: 'ENCRYPTION_KEY', variable: 'ENCRYPTION_KEY')
                ]) {
                    sh '''
                        set -eu
        
                        docker compose config --quiet
                        docker compose build
                    '''
                }
            }
        }


        stage('AWS login and push to ECR') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-jenkins',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    sh '''
                        set -eu

                        aws sts get-caller-identity

                        terraform init -input=false

                        FRONTEND_REPO_URI=$(terraform output -raw ecr_frontend_repo_uri)
                        BACKEND_REPO_URI=$(terraform output -raw ecr_backend_repo_uri)
                        
                        test -n "$FRONTEND_REPO_URI"
                        test -n "$BACKEND_REPO_URI"

                        aws ecr get-login-password \
                          --region "$AWS_DEFAULT_REGION" |
                          docker login \
                            --username AWS \
                            --password-stdin \
                            "$(echo "$FRONTEND_REPO_URI" | cut -d/ -f1)"

                        docker tag api-monitoring-frontend:latest \
                          "$FRONTEND_REPO_URI:latest"

                        docker tag api-monitoring-backend:latest \
                          "$BACKEND_REPO_URI:latest"

                        docker push "$FRONTEND_REPO_URI:latest"
                        docker push "$BACKEND_REPO_URI:latest"
                    '''
                }
            }
        }

        stage('Generate Ansible inventory') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-jenkins',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    sh '''
                        set -eu
        
                        export AWS_DEFAULT_REGION=us-east-1
        
                        aws sts get-caller-identity
        
                        terraform init -input=false
        
                        EC2_1_IP=$(terraform output -raw ec2_public_ip_1)
                        EC2_2_IP=$(terraform output -raw ec2_public_ip_2)
        
                        printf '[aws_vm]\\nserver1 ansible_host=%s\\nserver2 ansible_host=%s\\n' \
                            "$EC2_1_IP" "$EC2_2_IP" \
                            > ansible/myinventory.ini
        
                        ansible-inventory \
                            -i ansible/myinventory.ini \
                            --graph
                    '''
                }
            }
        }

        stage('Deploy with Ansible') {
            steps {
                withCredentials([
                    file(credentialsId: 'vm-key', variable: 'SSH_KEY')
                ]) {
                    sh '''
                        set -eu
                        chmod 400 "$SSH_KEY"

                        ANSIBLE_HOST_KEY_CHECKING=False \
                        ansible \
                          -i ansible/myinventory.ini \
                          all \
                          -u ubuntu \
                          --private-key "$SSH_KEY" \
                          -m ping

                        ANSIBLE_HOST_KEY_CHECKING=False \
                        ansible-playbook \
                          -i ansible/myinventory.ini \
                          -u ubuntu \
                          --private-key "$SSH_KEY" \
                          ansible/playbook.yaml
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        success {
            echo 'All stages passed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check stage logs.'
        }
    }
}
