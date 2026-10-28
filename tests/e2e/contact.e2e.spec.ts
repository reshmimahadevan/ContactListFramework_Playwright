import { test, expect } from '../../src/fixtures/pagefixtures';
import { uniqueEmail } from '../../src/utils/emailUtil';

test('@e2e sign up, add, edit, delete a contact and logout', async ({
    apiHelper, loginPage, signUpPage, contactListPage, addContactPage, contactDetailsPage, editContactPage,
}) => {
    const email = uniqueEmail('qa.user@example.com');
    const password = process.env.LOGIN_PASSWORD!;
    const contact = { firstName: 'Neha', lastName: 'Sharma', email: 'neha@example.com', phone: '9255550101', city: 'Pleasanton' };
    const fullName = `${contact.firstName} ${contact.lastName}`;
    const newPhone = '4085550199';
    const newCity = 'San Jose';
    let token: string = '';

    await test.step('Sign up a new user (UI) and confirm the account exists (API)', async () => {
        await signUpPage.goToSignUpPage();
        await signUpPage.signUp('Auto', 'Tester', email, password);
        await contactListPage.waitUntilLoaded();

        token = await apiHelper.login(email, password);   // fails if the account wasn't created
    });

    //test.step groups several actions into one named step inside a test. The test still runs the same way, but the report becomes much easier to read.
    await test.step('Add a contact (UI) and confirm the server saved it (API)', async () => {
        await contactListPage.clickAddContact();
        await addContactPage.addContact(contact);
        await contactListPage.waitUntilLoaded();
        await expect(contactListPage.contactRow(fullName)).toBeVisible();

        const contacts = await apiHelper.getContacts(token);
        expect(contacts).toHaveLength(1);
        expect(contacts[0].email).toBe(contact.email);
        expect(contacts[0].phone).toBe(contact.phone);
    });

    await test.step('Edit the contact (UI) and confirm the change was saved (API)', async () => {
        await contactListPage.openContact(fullName);
        await contactDetailsPage.waitUntilLoaded();
        await contactDetailsPage.clickEdit();
        await editContactPage.waitUntilLoaded();
        await editContactPage.editContact(newPhone, newCity);
        await contactDetailsPage.waitUntilLoaded();
        expect(await contactDetailsPage.getCity()).toBe(newCity);

        const [saved] = await apiHelper.getContacts(token);
        expect(saved.phone).toBe(newPhone);
        expect(saved.city).toBe(newCity);
    });

    await test.step('Delete the contact (UI) and confirm it is gone (API)', async () => {
        await contactDetailsPage.deleteContact();
        await contactListPage.waitUntilLoaded();
        await contactListPage.expectContactCount(0);

        expect(await apiHelper.getContacts(token)).toHaveLength(0);
    });

    await test.step('Logout', async () => {
        await contactListPage.logout();
        await expect.poll(() => loginPage.isLoginFormVisible()).toBeTruthy();
    });
});