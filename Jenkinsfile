// ═══════════════════════════════════════════════════════════════
// Jenkinsfile — Master CI/CD Pipeline (WINDOWS VERSION)
// Playwright TypeScript Framework
// ═══════════════════════════════════════════════════════════════
// Required Jenkins credentials (all "Secret text"):
//   dev-credentials, qa-credentials, stage-credentials, prod-credentials
//   dev-base-url, qa-base-url, stage-base-url, prod-base-url
//   api-base-url
// Reports per stage: PW HTML, Allure, ReportingLabs (3 x 4 envs = 12)
// ═══════════════════════════════════════════════════════════════

pipeline {
    agent any

    tools {
        nodejs 'NodeJS-24'
        maven 'Maven-3.9'
        jdk 'JDK-17'
        allure 'Allure'
    }

    options {
        timeout(time: 90, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    stages {

        stage('Build & Unit Tests') {
            steps {
                echo "Building App + Running Unit Tests"
                dir('dev-app') {
                    git url: 'https://github.com/jglick/simple-maven-project-with-tests.git',
                        branch: 'master'
                    bat 'mvn clean install -Dmaven.test.failure.ignore=true'
                }
            }
            post {
                always {
                    junit 'dev-app/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "Installing Playwright Dependencies"
                dir('qa-tests') {
                    git url: 'https://github.com/reshmimahadevan/ContactListFramework_Playwright.git',
                        branch: 'main'
                    bat 'npm ci'
                    bat 'npx playwright install chromium'
                }
            }
        }

        // ═════════════════════════════════════════════════
        // DEV
        // ═════════════════════════════════════════════════
        stage('Deploy to DEV') {
            steps {
                echo "Deploying to DEV..."
                echo "DEV deployment complete ✅"
            }
        }

        stage('DEV - Sanity') {
            steps {
                echo "Running SANITY @smoke on DEV"
                dir('qa-tests') {
                    bat '''
                        if exist allure-results rmdir /s /q allure-results
                        if exist reports rmdir /s /q reports
                        if exist reporting-labs rmdir /s /q reporting-labs
                    '''
                    withCredentials([
                        string(credentialsId: 'dev_credentials', variable: 'LOGIN_PASSWORD'),
                        string(credentialsId: 'dev_base_url', variable: 'BASE_URL'),
                        string(credentialsId: 'dev_api_base_url', variable: 'API_BASE_URL')
                    ]) {
                        bat '''
                            set ENV=dev
                            set GRANT_TYPE=client_credentials
                            npx playwright test --project=chromium --grep @smoke
                        '''
                    }
                }
            }
            post {
                always {
                    bat '''
                        if not exist reports-dev\\html mkdir reports-dev\\html
                        if not exist reports-dev\\allure mkdir reports-dev\\allure
                        if not exist reports-dev\\reportinglabs mkdir reports-dev\\reportinglabs
                    '''
                    bat 'xcopy qa-tests\\reports\\html-report reports-dev\\html /E /I /Y /Q || exit /b 0'
                    bat 'call allure generate qa-tests\\allure-results --clean -o reports-dev\\allure || exit /b 0'
                    bat 'xcopy qa-tests\\reporting-labs reports-dev\\reportinglabs /E /I /Y /Q || exit /b 0'
                    publishHTML(target: [
                        reportName: 'DEV Sanity - PW HTML Report',
                        reportDir: 'reports-dev/html',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'DEV Sanity - Allure Report',
                        reportDir: 'reports-dev/allure',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'DEV Sanity - ReportingLabs Report',
                        reportDir: 'reports-dev/reportinglabs',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                }
            }
        }

        // ═════════════════════════════════════════════════
        // QA
        // ═════════════════════════════════════════════════
        stage('Deploy to QA') {
            steps {
                echo "Deploying to QA..."
                echo "QA deployment complete ✅"
            }
        }

        stage('QA - Regression') {
            steps {
                echo "Running REGRESSION @regression on QA"
                dir('qa-tests') {
                    bat '''
                        if exist allure-results rmdir /s /q allure-results
                        if exist reports rmdir /s /q reports
                        if exist reporting-labs rmdir /s /q reporting-labs
                    '''
                    withCredentials([
                        string(credentialsId: 'qa_credentials', variable: 'LOGIN_PASSWORD'),
                        string(credentialsId: 'qa_base_url', variable: 'BASE_URL'),
                        string(credentialsId: 'qa_api_base_url', variable: 'API_BASE_URL')
                    ]) {
                        bat '''
                            set ENV=qa
                            set GRANT_TYPE=client_credentials
                            npx playwright test --project=chromium --grep "@smoke|@regression"
                        '''
                    }
                }
            }
            post {
                always {
                    bat '''
                        if not exist reports-qa\\html mkdir reports-qa\\html
                        if not exist reports-qa\\allure mkdir reports-qa\\allure
                        if not exist reports-qa\\reportinglabs mkdir reports-qa\\reportinglabs
                    '''
                    bat 'xcopy qa-tests\\reports\\html-report reports-qa\\html /E /I /Y /Q || exit /b 0'
                    bat 'call allure generate qa-tests\\allure-results --clean -o reports-qa\\allure || exit /b 0'
                    bat 'xcopy qa-tests\\reporting-labs reports-qa\\reportinglabs /E /I /Y /Q || exit /b 0'
                    publishHTML(target: [
                        reportName: 'QA Regression - PW HTML Report',
                        reportDir: 'reports-qa/html',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'QA Regression - Allure Report',
                        reportDir: 'reports-qa/allure',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'QA Regression - ReportingLabs Report',
                        reportDir: 'reports-qa/reportinglabs',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                }
            }
        }

        // ═════════════════════════════════════════════════
        // STAGE
        // ═════════════════════════════════════════════════
        stage('Deploy to STAGE') {
            steps {
                echo "Deploying to STAGE..."
                echo "STAGE deployment complete ✅"
            }
        }

        stage('STAGE - Sanity') {
            steps {
                echo "Running SANITY @smoke on STAGE"
                dir('qa-tests') {
                    bat '''
                        if exist allure-results rmdir /s /q allure-results
                        if exist reports rmdir /s /q reports
                        if exist reporting-labs rmdir /s /q reporting-labs
                    '''
                    withCredentials([
                        string(credentialsId: 'stage_credentials', variable: 'LOGIN_PASSWORD'),
                        string(credentialsId: 'stage_base_url', variable: 'BASE_URL'),
                        string(credentialsId: 'stage_api_base_url', variable: 'API_BASE_URL')
                    ]) {
                        bat '''
                            set ENV=stage
                            set GRANT_TYPE=client_credentials
                            npx playwright test --project=chromium --grep @smoke
                        '''
                    }
                }
            }
            post {
                always {
                    bat '''
                        if not exist reports-stage\\html mkdir reports-stage\\html
                        if not exist reports-stage\\allure mkdir reports-stage\\allure
                        if not exist reports-stage\\reportinglabs mkdir reports-stage\\reportinglabs
                    '''
                    bat 'xcopy qa-tests\\reports\\html-report reports-stage\\html /E /I /Y /Q || exit /b 0'
                    bat 'call allure generate qa-tests\\allure-results --clean -o reports-stage\\allure || exit /b 0'
                    bat 'xcopy qa-tests\\reporting-labs reports-stage\\reportinglabs /E /I /Y /Q || exit /b 0'
                    publishHTML(target: [
                        reportName: 'STAGE Sanity - PW HTML Report',
                        reportDir: 'reports-stage/html',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'STAGE Sanity - Allure Report',
                        reportDir: 'reports-stage/allure',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'STAGE Sanity - ReportingLabs Report',
                        reportDir: 'reports-stage/reportinglabs',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                }
            }
        }

        // ═════════════════════════════════════════════════
        // PROD APPROVAL
        // ═════════════════════════════════════════════════
        stage('Approval for PROD') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    input message: 'Deploy to PROD?',
                        ok: 'Yes, Deploy!',
                        submitter: 'admin'
                }
            }
        }

        // ═════════════════════════════════════════════════
        // PROD
        // ═════════════════════════════════════════════════
        stage('Deploy to PROD') {
            steps {
                echo "Deploying to PROD..."
                echo "PROD deployment complete ✅"
            }
        }

        stage('PROD - Smoke') {
            steps {
                echo "Running SMOKE @smoke on PROD"
                dir('qa-tests') {
                    bat '''
                        if exist allure-results rmdir /s /q allure-results
                        if exist reports rmdir /s /q reports
                        if exist reporting-labs rmdir /s /q reporting-labs
                    '''
                    withCredentials([
                        string(credentialsId: 'prod_credentials', variable: 'LOGIN_PASSWORD'),
                        string(credentialsId: 'prod_base_url', variable: 'BASE_URL'),
                        string(credentialsId: 'prod_api_base_url', variable: 'API_BASE_URL')
                    ]) {
                        bat '''
                            set ENV=prod
                            set GRANT_TYPE=client_credentials
                            npx playwright test --project=chromium --grep @smoke
                        '''
                    }
                }
            }
            post {
                always {
                    bat '''
                        if not exist reports-prod\\html mkdir reports-prod\\html
                        if not exist reports-prod\\allure mkdir reports-prod\\allure
                        if not exist reports-prod\\reportinglabs mkdir reports-prod\\reportinglabs
                    '''
                    bat 'xcopy qa-tests\\reports\\html-report reports-prod\\html /E /I /Y /Q || exit /b 0'
                    bat 'call allure generate qa-tests\\allure-results --clean -o reports-prod\\allure || exit /b 0'
                    bat 'xcopy qa-tests\\reporting-labs reports-prod\\reportinglabs /E /I /Y /Q || exit /b 0'
                    publishHTML(target: [
                        reportName: 'PROD Smoke - PW HTML Report',
                        reportDir: 'reports-prod/html',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'PROD Smoke - Allure Report',
                        reportDir: 'reports-prod/allure',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                    publishHTML(target: [
                        reportName: 'PROD Smoke - ReportingLabs Report',
                        reportDir: 'reports-prod/reportinglabs',
                        reportFiles: 'index.html',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                }
            }
        }
    }

    post {
        always {
            script {
                def buildStatus = currentBuild.currentResult
                def statusEmoji = buildStatus == 'SUCCESS' ? '✅' : '❌'
                def duration = currentBuild.durationString.replace(' and counting', '')

                emailext(
                    to: 'your-email@example.com',
                    subject: "🎭 CI/CD Pipeline — ${statusEmoji} ${buildStatus} — Build #${env.BUILD_NUMBER}",
                    mimeType: 'text/html',
                    body: """
                        <html>
                        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
                            <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                                <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 30px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 24px;">🎭 Playwright CI/CD Dashboard</h1>
                                    <p style="margin: 8px 0 0; opacity: 0.8;">Master Pipeline Report</p>
                                    <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-top: 12px; background: ${buildStatus == 'SUCCESS' ? '#28a745' : '#dc3545'}; color: white;">
                                        ${statusEmoji} ${buildStatus}
                                    </span>
                                </div>
                                <div style="padding: 24px;">
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr><td style="padding: 10px; color: #666;">Pipeline</td><td style="padding: 10px; font-weight: bold;">DEV → QA → STAGE → PROD</td></tr>
                                        <tr><td style="padding: 10px; color: #666;">Build</td><td style="padding: 10px; font-weight: bold;">#${env.BUILD_NUMBER}</td></tr>
                                        <tr><td style="padding: 10px; color: #666;">Duration</td><td style="padding: 10px; font-weight: bold;">${duration}</td></tr>
                                        <tr><td style="padding: 10px; color: #666;">Triggered by</td><td style="padding: 10px; font-weight: bold;">${currentBuild.getBuildCauses()[0]?.shortDescription ?: 'Manual'}</td></tr>
                                    </table>
                                </div>
                                <div style="background: #f8f9fa; padding: 20px 24px; border-top: 1px solid #eee;">
                                    <h3 style="margin: 0 0 12px;">📊 Reports (12 per build)</h3>
                                    <p style="color: #666; font-size: 13px; margin: 0 0 12px;">Each test stage publishes PW HTML + Allure + ReportingLabs. Open the Jenkins build page and use the sidebar.</p>
                                    <a href="${env.BUILD_URL}" style="display: inline-block; padding: 10px 20px; background: #1a1a2e; color: white; text-decoration: none; border-radius: 6px; margin: 4px;">📁 Open Jenkins Build</a>
                                    <a href="${env.BUILD_URL}console" style="display: inline-block; padding: 10px 20px; background: #6c757d; color: white; text-decoration: none; border-radius: 6px; margin: 4px;">🔍 Console Logs</a>
                                </div>
                            </div>
                        </body>
                        </html>
                    """
                )
            }
        }
        success {
            echo 'PIPELINE: ✅ SUCCESS'
        }
        failure {
            echo 'PIPELINE: ❌ FAILED'
        }
    }
}
