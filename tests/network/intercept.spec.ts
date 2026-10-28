import { test, expect } from '../../src/fixtures/pagefixtures';
import { uniqueEmail } from '../../src/utils/emailUtil';
import { meta } from 'reporting-labs';

//web app --> intercept the network calls and log them..
//**/* is a wildcard URL pattern. ** means “any path” and * means “any name”, so it matches every URL.
test('@smoke intercept and log the requests of the sign up', async ({ page, signUpPage, contactListPage }) => {

    await page.route('**/*', async (route) => {
        console.log(route.request().method(), route.request().url());
        await route.continue(); //url1 -- capture, url2 -- capture....
    });

    await signUpPage.goToSignUpPage();
    await signUpPage.signUp('Auto', 'Tester', uniqueEmail('qa.user@example.com'), process.env.LOGIN_PASSWORD!);
    await contactListPage.waitUntilLoaded();
});

//intercept with mocking:
//mocking: fake data/response:
test('@smoke mock the contacts API with fake JSON', async ({ page, signUpPage, contactListPage }) => {

    //JS
    let fakeContacts = [
        { _id: 'fake1', firstName: 'Fake', lastName: 'Macbook', birthdate: '1990-01-01', email: 'fake1@example.com', phone: '4155550001', street1: '1 Fake St', street2: '', city: 'Nowhere', stateProvince: 'CA', postalCode: '90001', country: 'USA' },
        { _id: 'fake2', firstName: 'Fake', lastName: 'Iphone', birthdate: '1991-02-02', email: 'fake2@example.com', phone: '4155550002', street1: '2 Fake St', street2: '', city: 'Nowhere', stateProvince: 'CA', postalCode: '90002', country: 'USA' },
    ];

    //only the GET that loads the list is faked, the rest goes to the real server
    await page.route('**/contacts', async (route) => {
        if (route.request().method() !== 'GET') {
            //fallback() first lets any other matching route handlers try, and then the request goes to the server. continue() skips straight to the server.
            await route.fallback();  //not my job, let it go through normally
            return;
        }
        await route.fulfill({    //GET: answer with the fake list
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(fakeContacts) //object->text
        });
    });

    await signUpPage.goToSignUpPage();
    await signUpPage.signUp('Auto', 'Tester', uniqueEmail('qa.user@example.com'), process.env.LOGIN_PASSWORD!);
    await contactListPage.waitUntilLoaded();

    expect(await contactListPage.isContactListed('Fake Macbook')).toBeTruthy();
    expect(await contactListPage.isContactListed('Fake Iphone')).toBeTruthy();
    expect(await contactListPage.getContactCount()).toBe(2);
});

test('@smoke mock the login API with a 401 - Negative test case', async ({ page, loginPage }) => {

    await page.route('**/users/login', async (route) => {
        await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: '{}'
        });
    });

    await loginPage.goToLoginPage();
    await loginPage.doLogin('anyone@example.com', process.env.LOGIN_PASSWORD!);
    expect(await loginPage.getErrorMessage()).toContain('Incorrect username or password');
    await expect(page).not.toHaveURL(/contactList/);
});
