import { defineConfig, devices } from '@playwright/test';
import reportingLabs from './reporting-labs.config';

import dotenv from 'dotenv';

//npm install dotenv
//ENV=qa npx playwright test
const ENV = process.env.ENV || "qa";
console.log('Running tests on Environment: ', ENV);
dotenv.config({ path: `config/.env.${ENV}` });

//The app is one public instance, so fall back to it when no env file / variable is present
//(ex: a bare `docker run`). Checked with || so an empty value from CI also falls back.
if (!process.env.BASE_URL) {
  process.env.BASE_URL = 'https://thinking-tester-contact-list.herokuapp.com';
}
if (!process.env.API_BASE_URL) {
  process.env.API_BASE_URL = process.env.BASE_URL;
}

export default defineConfig({
  testDir: './tests',

  //The Heroku app can take a while to wake up, so give every test and action some room
  timeout: 60_000,
  expect: { timeout: 10_000 },

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  //Undefined -> take 50 per by default
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    ['blob'],
    ['list'],
    ['html', { outputFolder: "reports/html-report", open: "never" }],
    ["allure-playwright", {
      outputFolder: "allure-results",
      suiteTitle: true,
    }],
    ['reporting-labs', reportingLabs]
  ]
    :
    [
      ["blob", { outputDir: "blob-report" }],
      ['list'],
      ['html', { outputFolder: "reports/html-report", open: "never" }],
      ["allure-playwright", {
        outputFolder: "allure-results",
        suiteTitle: true,
      }],
      ['reporting-labs', reportingLabs]
    ],

  use: {
    baseURL: process.env.BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    //By default CI = true
    //Local:false/CI:true
    headless: !process.env.CI ? false : true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

});
