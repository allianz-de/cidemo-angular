#!/usr/bin/env groovy

@Library('demo-pipeline-library') _

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    parameters {
        string( name: 'CF_BASE_HOST',
                defaultValue: 'local.pcfdev.io',
                description: 'Base host for CF apps')
    }

    tools {
        nodejs 'node-10'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('NPM Install') {
            steps {
                sh 'npm install'
            }
        }

        stage('Lint Code') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'npm run test:headless'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build:prod'
            }
        }

        stage('Deploy & Run E2E') {
            steps {
                sh 'npm run configure:nginx'

                script {
                    String appName = isFeatureBranch()
                                ? appNameFromManifest(append: env.BRANCH_NAME)
                                : appNameFromManifest()

                    cfPush([
                        appName: appName,
                        apiUrl: 'https://api.local.pcfdev.io',
                        org:    'pcfdev-org',
                        space:  'pcfdev-space',
                        credentialsId: 'pcf',
                        skipSSL: true
                    ])

                    build job: '/downstream/run-e2e-tests',
                          wait: true,
                          parameters: [string(name: 'APP_BASE_URL', value: "https://${appName}.${params.CF_BASE_HOST}/"),
                                       string(name: 'BRANCH', value: env.BRANCH_NAME)]
                }
            }
        }
    }

    post {
        success {
            script {
                createArtifact {
                    prefix = 'artifact-'
                    version = nextVersion()
                    sha = buildCommitSha()
                }

                uploadToArtifactory {
                    pattern = 'artifact-*.zip'
                    target = 'snapshot-local/cidemo-frontend/'
                }

                cleanUpArtifacts()
            }
        }
    }
}
