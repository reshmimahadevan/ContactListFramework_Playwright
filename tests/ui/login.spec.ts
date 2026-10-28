import { test, expect } from '../../src/fixtures/pagefixtures';
import { CsvHelper } from '../../src/utils/CsvHelper';
import { ExcelHelper } from '../../src/utils/ExcelHelper';
import { JsonHelper } from '../../src/utils/JsonHelper';
import { uniqueEmail } from '../../src/utils/emailUtil';
import { meta } from 'reporting-labs';
import { faker } from '@faker-js/faker';

test.beforeEach(async ({ loginPage }) => {
    await loginPage.goToLoginPage();
});

//AAA
test('@smoke login page heading test', async ({ loginPage }) => {

    let heading = await loginPage.getHeading();
    console.log('Login page heading : ', heading);
    expect(heading).toBe('Contact List App');
});

test('@smoke login page shows the login form', async ({ loginPage }) => {

    expect(await loginPage.isLoginFormVisible()).toBeTruthy();
});

test('@smoke sign up button opens the sign up page', async ({ loginPage, page }) => {

    await loginPage.clickSignUp();
    await expect(page).toHaveURL(/addUser/);
});

//the app has no fixed user, so: sign up (the app logs us in) -> logout -> login again
test('@smoke sign up and login with valid credentials', async ({ loginPage, signUpPage, contactListPage, page }) => {

    const email = uniqueEmail('user@example.com');
    const password = process.env.LOGIN_PASSWORD!;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    // Sign up
    await signUpPage.goToSignUpPage();
    await signUpPage.signUp(firstName, lastName, email, password);
    await contactListPage.waitUntilLoaded();
    await expect(page).toHaveURL(/contactList/);

    // Log out
    await contactListPage.logout();

    // Log in with the same new account
    await loginPage.goToLoginPage();
    await loginPage.doLogin(email, password);
    await contactListPage.waitUntilLoaded();
    await expect(page).toHaveURL(/contactList/);
});

//DD_0: using test data from fixtures: sequence run
// test('@regression login to app with invalid credentials with fixture data', async ({ loginPage, testData }) => {

//     for (let row of testData) {
//         await loginPage.goToLoginPage();
//         await loginPage.doLogin(row.username, row.password);
//         expect(await loginPage.getErrorMessage()).toContain('Incorrect username or password');
//     }
// });

//pros:
// light weight, easy to maintain/read, 3rd party lib, no license, flat files, fs, good for large set of test data
//DD_1: read csv data directly from the CSV file and loop the test method row wise...
let testCSVData = CsvHelper.readCsv('src/testdata/logindata.csv');
for (let row of testCSVData) {
    test(`@regression login to app with invalid credentials with CSV data - ${row.username}`, async ({ loginPage }) => {

        await loginPage.doLogin(row.username, row.password);
        expect(await loginPage.getErrorMessage()).toContain('Incorrect username or password');
    });
}

//cons:
//1. maintenance
//2. MS Licenses
//DD_2: read xlsx data directly from the excel file and loop the test method row wise...
// let testExcelData = ExcelHelper.readExcel('src/testdata/contactlist_testdata.xlsx', 'login');
// for (let row of testExcelData) {
//     test(`@regression login to app with invalid credentials with Excel data - ${row.username}`, async ({ loginPage }) => {

//         await loginPage.doLogin(row.username, row.password);
//         expect(await loginPage.getErrorMessage()).toContain('Incorrect username or password');
//     });
// }

//DD_3: read JSON data directly from the JSON file and loop the test method row wise...
// let testJSONData = JsonHelper.readJson('src/testdata/logindata.json');
// for (let row of testJSONData) {
//     test(`@regression login to app with invalid credentials with JSON data - ${row.username}`, async ({ loginPage }) => {

//         await loginPage.doLogin(row.username, row.password);
//         expect(await loginPage.getErrorMessage()).toContain('Incorrect username or password');
//     });
// }
