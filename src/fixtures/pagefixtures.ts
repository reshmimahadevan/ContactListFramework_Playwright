import { test as baseTest } from './apifixtures';
import { LoginPage } from '../pages/LoginPage';
import { SignUpPage } from '../pages/SignUpPage';
import { ContactListPage } from '../pages/ContactListPage';
import { AddContactPage } from '../pages/AddContactPage';
import { ContactDetailsPage } from '../pages/ContactDetailsPage';
import { EditContactPage } from '../pages/EditContactPage';
import { CsvHelper } from '../utils/CsvHelper';

//repo of page objects -> fixtures
type pageFixtures = {
    loginPage: LoginPage,
    signUpPage: SignUpPage,
    contactListPage: ContactListPage,
    addContactPage: AddContactPage,
    contactDetailsPage: ContactDetailsPage,
    editContactPage: EditContactPage,
    testData: Record<string, string>[];
};

//extend the playwright test: using baseTest.extend: inheritance
export let test = baseTest.extend<pageFixtures>({

    loginPage: async ({ page }, use) => {
        let loginPage = new LoginPage(page);
        await use(loginPage);
    },

    signUpPage: async ({ page }, use) => {
        let signUpPage = new SignUpPage(page);
        await use(signUpPage);
    },

    contactListPage: async ({ page }, use) => {
        let contactListPage = new ContactListPage(page);
        await use(contactListPage);
    },

    addContactPage: async ({ page }, use) => {
        let addContactPage = new AddContactPage(page);
        await use(addContactPage);
    },

    contactDetailsPage: async ({ page }, use) => {
        let contactDetailsPage = new ContactDetailsPage(page);
        await use(contactDetailsPage);
    },

    editContactPage: async ({ page }, use) => {
        let editContactPage = new EditContactPage(page);
        await use(editContactPage);
    },

    testData: async ({page}, use) => {
        let testCSVData = CsvHelper.readCsv('src/testdata/logindata.csv');
        await use(testCSVData);
    }

});

export { expect } from '@playwright/test';
