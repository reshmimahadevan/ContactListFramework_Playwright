import { test, expect } from '../../src/fixtures/pagefixtures';
import { CsvHelper } from '../../src/utils/CsvHelper';
import { ExcelHelper } from '../../src/utils/ExcelHelper';
import { JsonHelper } from '../../src/utils/JsonHelper';
import { uniqueEmail } from '../../src/utils/emailUtil';
import { meta } from 'reporting-labs';


//every test starts with a new user: sign up (the app logs us in) and open the Add Contact page
test.beforeEach(async ({ page, apiHelper, contactListPage, addContactPage }) => {
    
    const email = uniqueEmail('qa.user@example.com');
    const token = await apiHelper.createUser(email, process.env.LOGIN_PASSWORD!);

    await page.context().addCookies([{ name: 'token', value: token, url: process.env.BASE_URL! }]);

    await page.goto('/contactList');
    await contactListPage.waitUntilLoaded();
    await contactListPage.clickAddContact();
    await addContactPage.waitUntilLoaded();
});

test('@smoke add a contact with all the fields', async ({ addContactPage, contactListPage }) => {
    await addContactPage.addContact({
        firstName: 'Neha', lastName: 'Sharma', birthdate: '1990-05-15', email: 'neha@example.com',
        phone: '9255550101', street1: '4100 Main Street', street2: 'Suite 200', city: 'Pleasanton',
        stateProvince: 'CA', postalCode: '94566', country: 'USA'
    });

    await contactListPage.waitUntilLoaded();
    expect(await contactListPage.isContactListed('Neha Sharma')).toBeTruthy();
    expect(await contactListPage.getContactRowText('Neha Sharma')).toContain('neha@example.com');
});

test('@regression add a contact with the mandatory fields only', async ({ addContactPage, contactListPage }) => {

    await addContactPage.addContact({ firstName: 'Mandatory', lastName: 'Only' });
    await contactListPage.waitUntilLoaded();
    expect(await contactListPage.isContactListed('Mandatory Only')).toBeTruthy();
});

test('@regression cancel on the add contact page does not add a contact', async ({ addContactPage, contactListPage }) => {

    await addContactPage.cancel();
    await contactListPage.waitUntilLoaded();
    expect(await contactListPage.getContactCount()).toBe(0);
});

//DD_1: valid contacts from the CSV file
let testCSVData = CsvHelper.readCsv('src/testdata/contacts.csv');
for (let row of testCSVData) {
    test(`@regression add a contact with CSV data - ${row.firstName} ${row.lastName}`, async ({ addContactPage, contactListPage }) => {
        await addContactPage.addContact(row);
        await contactListPage.waitUntilLoaded();
        expect(await contactListPage.isContactListed(`${row.firstName} ${row.lastName}`)).toBeTruthy();
    });
}

//DD_2: valid contacts from the Excel file
// let testExcelData = ExcelHelper.readExcel('src/testdata/contactlist_testdata.xlsx', 'contacts');
// for (let row of testExcelData) {
//     test(`@regression add a contact with Excel data - ${row.firstName} ${row.lastName}`, async ({ addContactPage, contactListPage }) => {
//         meta({ priority: 'P1', owner: 'Reshmi', feature: 'Add contact' });

//         await addContactPage.addContact(row);
//         await contactListPage.waitUntilLoaded();
//         expect(await contactListPage.isContactListed(`${row.firstName} ${row.lastName}`)).toBeTruthy();
//     });
// }

//DD_3: invalid contacts from the JSON file: the form shows a validation error
// let testJSONData = JsonHelper.readJson('src/testdata/invalidcontacts.json');
// for (let row of testJSONData) {
//     test(`@regression add a contact with invalid JSON data - ${row.testName}`, async ({ addContactPage }) => {
//         meta({ priority: 'P1', owner: 'Reshmi', feature: 'Add contact' });

//         await addContactPage.addContact(row);
//         expect(await addContactPage.getErrorMessage()).toContain('validation failed');
//     });
// }
