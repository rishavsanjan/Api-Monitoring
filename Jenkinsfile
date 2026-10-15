pipeline {
    agents any
    tools {
        nodejs 'nodejs'
        go 'go'
    }
    stages {
        stage('Checkout'){
            steps{
                git branch: 'main',
                url: 'https://github.com/rishavsanjan/api-monitoring'
            }
        }
        stage('Build services'){
            parallel {
                stage('Build backend'){
                    dir('frontend'){
                        sh 'npm install'
                    }
                }   
                stage('Build backend'){
                    sh 'go mod download'
                }
            }
        }
        stage('Docker image build'){
            steps{
                echo 'Building docker images'
                sh 'docker compose build'
                echo 'docker images built successfully'
            }
        }
        

    }
}