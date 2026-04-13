pipeline {
  agent any
  environment {
    NODE_ENV = 'production'
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Build') {
      steps {
        sh 'npx prisma generate'
        sh 'npm run build'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test -- --runInBand'
      }
    }
    stage('Docker Build') {
      steps {
        sh 'docker build -t agriya-backend-nest:${BUILD_NUMBER} .'
      }
    }
  }
}
