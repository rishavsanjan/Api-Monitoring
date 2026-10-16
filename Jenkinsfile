pipeline {
    agents any
    tools {
        nodejs 'nodejs'
        go 'go'
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
                stage('Build backend') {
                    dir('frontend') {
                        sh 'npm install'
                    }
                }
                stage('Build backend') {
                    dir('backend') {
                        sh 'go mod download' 
                    }
                    
                }
            }
        }
        stage('Docker image build') {
            steps {
                echo 'Building docker images'
                sh 'docker compose build'
                echo 'docker images built successfully'
            }
        }
    }
    stage('AWS login and image push onto ecr') {
        steps {
            withCredentials([
                usernamePassword(
                    credentialsId: 'aws-jenkins',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )
            ]) {
                echo 'Pushing images onto ECR'

                sh '''
                    export AWS_DEFAULT_REGION=us-east-1

                    aws sts get-caller-identity

                    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 945945134870.dkr.ecr.us-east-1.amazonaws.com
                    ocker tag api-monitoring-backend:latest 945945134870.dkr.ecr.us-east-1.amazonaws.com/devops-cloud-p1-backend:latest
                    docker push 945945134870.dkr.ecr.us-east-1.amazonaws.com/api-monitoring-backend:latest

                    docker tag api-monitoring-frontend:latest 945945134870.dkr.ecr.us-east-1.amazonaws.com/devops-cloud-p1-frontend:latest
                    docker push 945945134870.dkr.ecr.us-east-1.amazonaws.com/devops-cloud-p1-frontend:latest
                '''

                echo 'Images pushed successfully!'
            }
        }
    }

    stage('Generate ansible inventory') {
        steps {
            withCredentials([
                usernamePassword(
                    credentialsId: 'aws-jenkins',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )
            ]) {
                sh '''
                   export AWS_DEFAULT_REGION=us-east-1

                   echo "Initializing Terraform..."

                   terraform init -input = false
                    EC2_1_IP=$(terraform output -raw ec2_1_public_ip)
                   EC2_2_IP=$(terraform output -raw ec2_2_public_ip)

                   EC2_1_IP=$(terraform output -raw ec2_1_public_ip)
                   EC2_2_IP=$(terraform output -raw ec2_2_public_ip)
                   printf '[aws_vm]\\nserver1 ansible_host=%s\\nserver2 ansible_host=%s\\n' \
                       "$EC2_1_IP" "$EC2_2_IP" \
                       > ansible/myinventory.ini
                   echo "Generated Ansible inventory:"
                   cat ansible/myinventory.ini
                   echo "Validating Ansible inventory..."
                   ansible-inventory \
                       -i ansible/myinventory.ini \
                       --graph

                '''
            }
        }
    }
    stage('Deploy with ansible') {
            steps {
                withCredentials([
                    file(credentialsId: 'vm-key', variable: 'SSH_KEY')
                ]) {
                    sh '''
                        chmod 400 "$SSH_KEY"

                        echo "Testing Ansible connectivity..."

                        ANSIBLE_HOST_KEY_CHECKING=False \
                        ansible \
                        -i ansible/myinventory.ini \
                        all \
                        -u ubuntu \
                        --private-key "$SSH_KEY" \
                        -m ping

                        echo "Deploying application..."

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

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        success {
            echo 'All stages passed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check stage logs for errors.'
        }
    }
}
