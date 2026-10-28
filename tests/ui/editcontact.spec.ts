import { test, expect } from '../../src/fixtures/pagefixtures';
import { uniqueEmail } from '../../src/utils/emailUtil';

// Test data in one place: setup and assertions both read from here
const contact = {
    firstName: 'Neha',
    lastName: 'Sharma',
    email: 'neha@example.com',
    phone: '9255550101',
    city: 'Pleasanton',
};
const fullName = `${contact.firstName} ${contact.lastName}`;

let token: string;
let contactId: string;

// Setup through the API (fast): new user + one contact, then open the contact list already logged in
test.beforeEach(async ({ page, apiHelper, contactListPage }) => {
    token = await apiHelper.createUser(uniqueEmail('qa.user@example.com'), process.env.LOGIN_PASSWORD!);
    const created = await apiHelper.createContact(token, contact);
    contactId = created._id;

    await page.context().addCookies([{ name: 'token', value: token, url: process.env.BASE_URL! }]);
    await page.goto('/contactList');
    await contactListPage.waitUntilLoaded();
});

test('@smoke contact details page shows the saved contact', async ({ contactListPage, contactDetailsPage }) => {
    await contactListPage.openContact(fullName);
    await contactDetailsPage.waitUntilLoaded();

    expect(await contactDetailsPage.getFullName()).toBe(fullName);
    expect(await contactDetailsPage.getEmail()).toBe(contact.email);
    expect(await contactDetailsPage.getPhone()).toBe(contact.phone);
});

test('@smoke edit a contact', async ({ apiHelper, contactListPage, contactDetailsPage, editContactPage }) => {
    const newPhone = '4085550199';
    const newCity = 'San Jose';

    await contactListPage.openContact(fullName);
    await contactDetailsPage.waitUntilLoaded();
    await contactDetailsPage.clickEdit();

    await editContactPage.waitUntilLoaded();
    await editContactPage.editContact(newPhone, newCity);

    // UI check
    await contactDetailsPage.waitUntilLoaded();
    expect(await contactDetailsPage.getPhone()).toBe(newPhone);
    expect(await contactDetailsPage.getCity()).toBe(newCity);

    // API check: the server really saved it
    const saved = await apiHelper.getContact(token, contactId);
    expect(saved.phone).toBe(newPhone);
    expect(saved.city).toBe(newCity);
});

test('@regression edit a contact with an invalid phone number', async ({ apiHelper, contactListPage, contactDetailsPage, editContactPage }) => {
    const invalidPhone = 'abc';   // intentionally invalid input

    await contactListPage.openContact(fullName);
    await contactDetailsPage.waitUntilLoaded();
    await contactDetailsPage.clickEdit();

    await editContactPage.waitUntilLoaded();
    await editContactPage.editContact(invalidPhone, 'San Jose');
    expect(await editContactPage.getErrorMessage()).toContain('phone');

    // API check: nothing was saved
    const saved = await apiHelper.getContact(token, contactId);
    expect(saved.phone).toBe(contact.phone);
    expect(saved.city).toBe(contact.city);
});