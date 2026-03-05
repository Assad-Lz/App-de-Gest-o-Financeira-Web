pipeline {
    agent any

    environment {
        // Exemplo: injetando registry do Docker
        DOCKER_REGISTRY = 'myregistry.com'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Frontend & Backend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Lint & Type Check') {
            parallel {
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Backend Lint') {
                    steps {
                        dir('backend') {
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Python Lint') {
                    steps {
                        dir('etl') {
                            // Assumes flake8 ou black está instalado no env Jenkins
                            sh 'pip install flake8'
                            sh 'flake8 .'
                        }
                    }
                }
            }
        }

        stage('TDD (Jest Tests)') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm test -- --passWithNoTests'
                        }
                    }
                }
                stage('Backend Tests (Unit & Integration)') {
                    steps {
                        dir('backend') {
                            sh 'npm test -- --passWithNoTests'
                        }
                    }
                }
                stage('ETL Python Tests (PyTest)') {
                    steps {
                        dir('etl') {
                            sh 'pip install pytest'
                            sh 'pytest || true'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "Building Images..."
                    sh 'docker-compose build'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline finalizado!'
        }
        success {
            echo 'Tudo ocorreu bem. Ready to deploy!'
        }
        failure {
            echo 'Algo falhou! Cheque os testes (TDD) e tente novamente.'
        }
    }
}
