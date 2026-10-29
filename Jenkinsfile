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
        jdk 'JDK-21'
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
                        branch: 'master'
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
                    bat '''
                        for /f "delims=" %%A in ('dir /s /b "C:\\Users\\reshm\\.jenkins\\tools\\org.allurereport.jenkins.tools.AllureCommandlineInstallation\\Allure\\allure.cmd" "C:\\Users\\reshm\\.jenkins\\tools\\org.allurereport.jenkins.tools.AllureCommandlineInstallation\\Allure\\allure.bat" 2^>nul') do set ALLURE_BIN=%%A
                        call "%ALLURE_BIN%" generate qa-tests\\allure-results --clean -o reports-dev\\allure || exit /b 0
                    '''
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
                    bat '''
                        for /f "delims=" %%A in ('dir /s /b "C:\\Users\\reshm\\.jenkins\\tools\\org.allurereport.jenkins.tools.AllureCommandlineInstallation\\Allure\\allure.cmd" "C:\\Users\\reshm\\.jenkins\\tools\\org.allurereport.jenkins.tools.AllureCommandlineInstallation\\Allure\\allure.bat" 2^>nul') do set ALLURE_BIN=%%A
                        call "%ALLURE_BIN%" generate qa-tests\\allure-results --clean -o reports-qa\\allure || exit /b 0
                    '''
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
                    bat '''
                        for /f "delims=" %%A in ('dir /s /b "C:\\Users\\reshm\\.jenkins\\tools\\org.allurereport.jenkins.tools.AllureCommandlineInstallation\\Allure\\allure.cmd" "C:\\Users\\reshm\\.jenkins\\tools\\org.allurereport.jenkins.tools.AllureCommandlineInstallation\\Allure\\allure.bat" 2^>nul') do set ALLURE_BIN=%%A
                        call "%ALLURE_BIN%" generate qa-tests\\allure-results --clean -o reports-stage\\allure || exit /b 0
                    '''
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
                    bat '''
                        for /f "delims=" %%A in ('dir /s /b "C:\\Users\\reshm\\.jenkins\\tools\\org.allurereport.jenkins.tools.AllureCommandlineInstallation\\Allure\\allure.cmd" "C:\\Users\\reshm\\.jenkins\\tools\\org.allurereport.jenkins.tools.AllureCommandlineInstallation\\Allure\\allure.bat" 2^>nul') do set ALLURE_BIN=%%A
                        call "%ALLURE_BIN%" generate qa-tests\\allure-results --clean -o reports-prod\\allure || exit /b 0
                    '''
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
        success {
            echo 'PIPELINE: ✅ SUCCESS'
        }
        failure {
            echo 'PIPELINE: ❌ FAILED'
        }
    }
}
