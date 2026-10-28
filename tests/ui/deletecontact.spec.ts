import { test, expect } from '../../src/fixtures/pagefixtures';
import { uniqueEmail } from '../../src/utils/emailUtil';

test('@smoke delete a contact', async ({ page, apiHelper, contactListPage, contactDetailsPage }) => {
    const fullName = 'Delete Me';

    // Setup through the API
    const token = await apiHelper.createUser(uniqueEmail('qa.user@example.com'), process.env.LOGIN_PASSWORD!);
    const created = await apiHelper.createContact(token, { firstName: 'Delete', lastName: 'Me' });

    await page.context().addCookies([{ name: 'token', value: token, url: process.env.BASE_URL! }]);
    await page.goto('/contactList');
    await contactListPage.waitUntilLoaded();

    // UI: the part this test is about
    await contactListPage.openContact(fullName);
    await contactDetailsPage.waitUntilLoaded();
    await contactDetailsPage.deleteContact();

    // UI check
    await contactListPage.waitUntilLoaded();
    //expect.poll means keep running this function again and again until the result matches, or give up after the timeout.
    await expect.poll(() => contactListPage.getContactCount()).toBe(0);

    // API check: the server no longer has it
    const res = await apiHelper.get(`/contacts/${created._id}`, { Authorization: `Bearer ${token}` });
    expect(res.status()).toBe(404);
});