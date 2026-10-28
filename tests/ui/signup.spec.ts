import { test, expect } from '../../src/fixtures/pagefixtures';
import { CsvHelper } from '../../src/utils/CsvHelper';
import { uniqueEmail } from '../../src/utils/emailUtil';
import { meta } from 'reporting-labs';

test.beforeEach(async ({ signUpPage }) => {
    await signUpPage.goToSignUpPage();
});

//DD: sign up with every row of the CSV file: the email is made unique at run time
let testCSVData = CsvHelper.readCsv('src/testdata/signupdata.csv');
for (let row of testCSVData) {
    test(`@smoke sign up to app with CSV data - ${row.firstName} - ${row.lastName}`, async ({ signUpPage, contactListPage, page }) => {

        await signUpPage.signUp(row.firstName, row.lastName, uniqueEmail(row.email), row.password);
        await contactListPage.waitUntilLoaded();
        await expect(page).toHaveURL(/contactList/);
    });
}

test('@regression sign up with an email that is already registered', async ({ signUpPage, contactListPage }) => {

    let email = uniqueEmail('dup.user@example.com');
    await signUpPage.signUp('Dup', 'User', email, 'Test@1234');
    await contactListPage.waitUntilLoaded();
    await contactListPage.logout();

    //same email again
    await signUpPage.goToSignUpPage();
    await signUpPage.signUp('Dup', 'User', email, 'Test@1234');
    expect(await signUpPage.getErrorMessage()).toContain('Email address is already in use');
});

test('@regression sign up with a password shorter than 7 characters', async ({ signUpPage }) => {

    await signUpPage.signUp('Short', 'Pass', uniqueEmail('short@example.com'), 'abc12');
    expect(await signUpPage.getErrorMessage()).toContain('password');
});

test('@regression sign up without a first name', async ({ signUpPage }) => {

    await signUpPage.signUp('', 'NoFirst', uniqueEmail('nofirst@example.com'), 'Test@1234');
    expect(await signUpPage.getErrorMessage()).toContain('firstName');
});

test('@regression cancel on the sign up page goes back to the login page', async ({ signUpPage, loginPage }) => {

    await signUpPage.cancel();
    expect(loginPage.isLoginFormVisible()).toBeTruthy();
});
