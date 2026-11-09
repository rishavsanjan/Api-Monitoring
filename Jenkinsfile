
pipeline {
    agent any

    tools {
        nodejs 'nodejs'
        go 'go'
    }

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = '945945134870'

        FRONTEND_LOCAL_IMAGE = 'api-monitoring-frontend'
        BACKEND_LOCAL_IMAGE = 'api-monitoring-backend'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/rishavsanjan/api-monitoring'

                script {
                    env.IMAGE_TAG = sh(
                        script: 'git rev-parse --short=12 HEAD',
                        returnStdout: true
                    ).trim()

                    echo "Building images with tag: ${env.IMAGE_TAG}"
                }
            }
        }

        stage('Build and Test Services') {
            parallel {

                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }

                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'go mod download'
                            sh 'go test ./...'
                        }
                    }
                }
            }
        }

        stage('Docker Image Build') {
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
        
                        docker compose build web backend
                    '''
                }
            }
        }

        stage('Push Images to ECR') {
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

                        FRONTEND_REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/api-monitoring-ecr-repositry-frontend"

                        BACKEND_REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/api-monitoring-ecr-repositry-backend"

                        ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"

                        aws ecr get-login-password \
                            --region "$AWS_DEFAULT_REGION" |
                            docker login \
                                --username AWS \
                                --password-stdin "$ECR_REGISTRY"

                        # Frontend
                        docker tag "$FRONTEND_LOCAL_IMAGE:latest" \
                            "$FRONTEND_REPO_URI:$IMAGE_TAG"

                        docker tag "$FRONTEND_LOCAL_IMAGE:latest" \
                            "$FRONTEND_REPO_URI:latest"

                        # Backend
                        docker tag "$BACKEND_LOCAL_IMAGE:latest" \
                            "$BACKEND_REPO_URI:$IMAGE_TAG"

                        docker tag "$BACKEND_LOCAL_IMAGE:latest" \
                            "$BACKEND_REPO_URI:latest"

                        # Push versioned images
                        docker push "$FRONTEND_REPO_URI:$IMAGE_TAG"
                        docker push "$BACKEND_REPO_URI:$IMAGE_TAG"

                        # Push latest tags
                        docker push "$FRONTEND_REPO_URI:latest"
                        docker push "$BACKEND_REPO_URI:latest"
                    '''
                }
            }
        }


        stage('Update Launch Template') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-jenkins',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    ),
                    string(
                        credentialsId: 'APP_SECRET_ARN',
                        variable: 'APP_SECRET_ARN'
                    )
                ]) {
                    sh '''
                        set -eu
        
                        terraform init -input=false
        
                        terraform validate
        
                        terraform plan \
                            -input=false \
                            -var="image_tag=$IMAGE_TAG" \
                            -var="aws_region=$AWS_DEFAULT_REGION" \
                            -var="app_secret_arn=$APP_SECRET_ARN" \
                            -out=tfplan
        
                        terraform apply \
                            -input=false \
                            -auto-approve \
                            tfplan
                    '''
                }
            }
        }


        stage('ASG Instance Refresh') {
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

                        ASG_NAME=$(terraform output -raw autoscaling_group_name)

                        echo "Auto Scaling Group: $ASG_NAME"

                        echo "Starting instance refresh..."

                        REFRESH_ID=$(aws autoscaling start-instance-refresh \
                            --auto-scaling-group-name "$ASG_NAME" \
                            --preferences '{
                                "MinHealthyPercentage": 90,
                                "MaxHealthyPercentage": 110,
                                "InstanceWarmup": 300,
                                "SkipMatching": true
                            }' \
                            --query 'InstanceRefreshId' \
                            --output text)

                        echo "Instance refresh started: $REFRESH_ID"

                        echo "Checking refresh status..."

                        while true; do

                            STATUS=$(aws autoscaling describe-instance-refreshes \
                                --auto-scaling-group-name "$ASG_NAME" \
                                --instance-refresh-ids "$REFRESH_ID" \
                                --query 'InstanceRefreshes[0].Status' \
                                --output text)

                            echo "Refresh status: $STATUS"

                            case "$STATUS" in
                                Successful)
                                    echo "ASG deployment completed successfully!"
                                    break
                                    ;;

                                Failed|Cancelled|RollbackFailed|RollbackSuccessful)
                                    echo "ASG deployment failed or was rolled back."
                                    exit 1
                                    ;;

                                *)
                                    sleep 20
                                    ;;
                            esac

                        done
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
            echo 'Application successfully deployed through Auto Scaling Group!'
        }

        failure {
            echo 'Pipeline failed. Check Jenkins console logs.'
        }
    }
}
