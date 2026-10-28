import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class EditContactPage extends BasePage {

    private readonly firstName: Locator;
    private readonly phone: Locator;
    private readonly city: Locator;
    private readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.firstName = page.getByLabel('First Name:');
        this.phone = page.getByLabel('Phone:');
        this.city = page.locator('#city');
        this.submitButton = page.getByRole('button', { name: 'Submit' });;
    }

    //the form is filled with the saved contact after an API call: wait for it,otherwise our typing could be overwritten
    async waitUntilLoaded() {
        await this.page.waitForURL(/editContact/);
        //Checking wherther the first name field is filled with a value, if not wait until it is filled as its mandatory field
        await expect(this.firstName).not.toHaveValue('');
    }

    async editContact(phone: string, city: string) {
        await this.phone.fill(phone);
        await this.city.fill(city);
        await this.submitButton.click();
    }

}
