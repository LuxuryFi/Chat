// CHANGEME
def repoName = "sysfxp/dev-k8s"
def repoTag = ":ma-clients-latest"
def buildBranch = "development/master"
def builtImage

pipeline {

  agent {
    // target Label for jenkins worker Pods, independent from nodeSelector
    label 'docker-worker'
  }

  environment {
    SSH_KEY = credentials('jenkins-private-key-read-gitlab-dependencies')
    IMAGE_REGISTRY_CREDENTIALS = 'dockerhub_id'
    AWX_API_USER = credentials('jenkins-awx-api-user')
    AWX_API_PASSWORD = credentials('jenkins-awx-api-password')
    AWX_API_URL = credentials('jenkins-awx-api-url')
  }

  stages {

    stage('Build Development image') {
      when {
        branch buildBranch
      }

      steps {
        script {
          MY_KEY = sh(
              script: 'cat $SSH_KEY',
              returnStdout: true
            ).trim()
          def arguments = "--build-arg GIT_SSH_PRIVATE_KEY=\"${MY_KEY}\" .".toString()
          builtImage = docker.build(repoName + repoTag , "${arguments}" )
        }
      }
    }

    stage('Push to Development Docker Hub') {
      when {
        branch buildBranch
      }

      steps {
        script {
          docker.withRegistry('', IMAGE_REGISTRY_CREDENTIALS) {
            builtImage.push()
          }
        }
      }
    }
    
    stage('Deploy to Dev environment using AWX') {
      when {
        branch buildBranch
      }
      
      steps {
        script {
          def json = '''\
            {"extra_vars": {"microservice_identifier": "ma-clients"}}
          '''
          sh "curl -XPOST -H 'Content-Type: application/json'  \
          -d '${json}' \
          --user $AWX_API_USER:$AWX_API_PASSWORD $AWX_API_URL"
        }
      }
    }

  }
}
