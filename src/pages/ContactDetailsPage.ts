import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ContactDetailsPage extends BasePage {

    private readonly firstName: Locator;
    private readonly lastName: Locator;
    private readonly email: Locator;
    private readonly phone: Locator;
    private readonly city: Locator;
    private readonly editButton: Locator;
    private readonly deleteButton: Locator;

    constructor(page: Page) {
        super(page);
        this.firstName = page.locator('#firstName');
        this.lastName = page.locator('#lastName');
        this.email = page.locator('#email');
        this.phone = page.locator('#phone');
        this.city = page.locator('#city');
        this.editButton = page.getByRole('button', { name: 'Edit Contact' });;
        this.deleteButton = page.getByText('Delete Contact', { exact: true });;
    }

    //the values are filled in after an API call: wait until the name is there
    async waitUntilLoaded() {
        await this.page.waitForURL(/contactDetails/);
        await expect(this.firstName).not.toBeEmpty();
    }

    async getFullName(): Promise<string> {
        return `${await this.firstName.innerText()} ${await this.lastName.innerText()}`;
    }

    async getEmail(): Promise<string> {
        return await this.email.innerText();
    }

    async getPhone(): Promise<string> {
        return await this.phone.innerText();
    }

    async getCity(): Promise<string> {
        return await this.city.innerText();
    }

    async clickEdit() {
        await this.editButton.click();
    }

    //the app asks "Are you sure?" in a browser confirm() dialog: handle it BEFORE the click
    async deleteContact() {
        //page.once - > handles only the next dialog, then removes itself. It’s the right choice when you expect exactly one dialog.
        this.page.once('dialog', dialog => dialog.accept()); //Registering
        await this.deleteButton.click(); //Triggering
    }

}
