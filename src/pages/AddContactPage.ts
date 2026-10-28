import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class AddContactPage extends BasePage {

    private readonly firstName: Locator;
    private readonly lastName: Locator;
    private readonly birthdate: Locator;
    private readonly email: Locator;
    private readonly phone: Locator;
    private readonly street1: Locator;
    private readonly street2: Locator;
    private readonly city: Locator;
    private readonly stateProvince: Locator;
    private readonly postalCode: Locator;
    private readonly country: Locator;
    private readonly submitButton: Locator;
    private readonly cancelButton: Locator;

    constructor(page: Page) {
        super(page);
        this.firstName = page.getByRole('textbox', { name: '* First Name:' });
        this.lastName = page.getByRole('textbox', { name: '* Last Name:' });;
        this.birthdate = page.getByRole('textbox', { name: 'Date of Birth:' });;
        this.email = page.getByRole('textbox', { name: 'Email:' });;
        this.phone = page.getByLabel('Phone:');
        this.street1 = page.getByLabel('Street Address 1:');
        this.street2 = page.getByLabel('Street Address 2:');
        this.city = page.getByRole('textbox', { name: 'City:' });
        this.stateProvince = page.getByLabel('State or Province:');
        this.postalCode = page.getByLabel('Postal Code:');
        this.country = page.getByLabel('Country:');
        this.submitButton = page.getByRole('button', { name: 'Submit' });
        this.cancelButton = page.locator('#cancel');
    }

    async waitUntilLoaded() {
        await this.page.waitForURL(/addContact/);
        await this.firstName.waitFor();
    }

    //contact is one row of the CSV / Excel / JSON file (or a plain object); a missing key means an empty field
    //contact.firstName, and if it doesn’t exist, use an empty string.”
    async addContact(contact: Record<string, string>) {
        await this.firstName.fill(contact.firstName ?? '');
        await this.lastName.fill(contact.lastName ?? '');
        await this.birthdate.fill(contact.birthdate ?? '');
        await this.email.fill(contact.email ?? '');
        await this.phone.fill(contact.phone ?? '');
        await this.street1.fill(contact.street1 ?? '');
        await this.street2.fill(contact.street2 ?? '');
        await this.city.fill(contact.city ?? '');
        await this.stateProvince.fill(contact.stateProvince ?? '');
        await this.postalCode.fill(contact.postalCode ?? '');
        await this.country.fill(contact.country ?? '');
        await this.submitButton.click();
    }

    async cancel() {
        await this.cancelButton.click();
    }

}
