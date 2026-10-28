import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class SignUpPage extends BasePage {

    private readonly firstName: Locator;
    private readonly lastName: Locator;
    private readonly email: Locator;
    private readonly password: Locator;
    private readonly submitButton: Locator;
    private readonly cancelButton: Locator;

    constructor(page: Page) {
        super(page);
        this.firstName = page.getByRole('textbox', { name: 'First Name' });;
        this.lastName = page.getByRole('textbox', { name: 'Last Name' });
        this.email = page.locator('#email');
        this.password = page.getByRole('textbox', { name: 'Password' });
        this.submitButton = page.getByRole('button', { name: 'Submit' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    }

    async goToSignUpPage() {
        await this.page.goto('/addUser');
    }

    async signUp(firstName: string, lastName: string, email: string, password: string) {
        await this.firstName.fill(firstName);
        await this.lastName.fill(lastName);
        await this.email.fill(email);
        await this.password.fill(password);
        await this.submitButton.click();
    }

    async cancel() {
        await this.cancelButton.click();
    }

}
