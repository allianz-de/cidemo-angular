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
                defaultValue: 'cfapps.io',
                description: 'Base host for CF apps')

        string( name: 'CF_API',
                defaultValue: 'https://api.run.pivotal.io',
                description: 'Cloud Foundry API Endpoint')

        string( name: 'CF_ORG',
                defaultValue: 'azd-cidemo',
                description: 'PCF Organization')

        string( name: 'CF_SPACE',
                defaultValue: 'development',
                description: 'PCF Space')
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
                        apiUrl: params.CF_API,
                        org:    params.CF_ORG,
                        space:  params.CF_SPACE,
                        credentialsId: 'pcf'
                    ])

                    // build job: '/downstream/run-e2e-tests',
                    //       wait: true,
                    //       parameters: [string(name: 'APP_BASE_URL', value: "https://${appName}.${params.CF_BASE_HOST}/"),
                    //                    string(name: 'BRANCH', value: env.BRANCH_NAME)]
                }
            }
        }
    }

    // post {
    //     success {
    //         script {
    //             createArtifact {
    //                 prefix = 'artifact-'
    //                 version = nextVersion()
    //                 sha = buildCommitSha()
    //             }

    //             uploadToArtifactory {
    //                 pattern = 'artifact-*.zip'
    //                 target = 'snapshot-local/cidemo-frontend/'
    //             }

    //             cleanUpArtifacts()
    //         }
    //     }
    // }
}
