import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ContactListPage extends BasePage {

    private readonly addContactButton: Locator;
    private readonly logoutButton: Locator;
    private readonly contactRows: Locator;

    constructor(page: Page) {
        super(page);
        this.addContactButton = page.getByRole('button', { name: 'Add a New Contact' });
        this.logoutButton = page.locator('#logout');
        this.contactRows = page.locator('tr.contactTableBodyRow');
    }

    //sign up / login redirect here: wait until the page is ready
    async waitUntilLoaded() {
        await this.page.waitForURL(/contactList/);
        //waitFor - waits until that specific element is visible (the default state is 'visible'). It confirms the page content has actually rendered.
        await this.addContactButton.waitFor();
    }

    async clickAddContact() {
        await this.addContactButton.click();
    }

    async logout() {
        await this.logoutButton.click();
    }

    //the table is filled after an API call, so wait for the row to show up
    async isContactListed(fullName: string): Promise<boolean> {
        try {
            await this.contactRows.filter({ hasText: fullName }).first().waitFor();
            return true;
        } catch {
            return false;
        }
    }

    async getContactRowText(fullName: string): Promise<string> {
        return await this.contactRows.filter({ hasText: fullName }).first().innerText();
    }

    async getContactCount(): Promise<number> {
        return await this.contactRows.count();
    }

    async openContact(fullName: string) {
        await this.contactRows.filter({ hasText: fullName }).first().click();
    }

    contactRow(fullName: string) {
        return this.contactRows.filter({ hasText: fullName });
    }

    async expectContactCount(count: number) {
        await expect(this.contactRows).toHaveCount(count);
    }

}
