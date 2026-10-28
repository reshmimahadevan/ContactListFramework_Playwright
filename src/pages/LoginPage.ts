import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {

    //1. private Locators:
    private readonly heading: Locator;
    private readonly emailInput: Locator;
    private readonly passwordInput: Locator;
    private readonly submitButton: Locator;
    private readonly signUpButton: Locator;

    //2. constructor of the page class: init the locators:
    constructor(page: Page) {
        super(page);
        this.heading = page.getByRole('heading', { name: 'Contact List App', level: 1 });
        this.emailInput = page.getByRole('textbox', { name: 'Email' });
        this.passwordInput = page.getByRole('textbox', { name: 'Password' });
        this.submitButton = page.getByRole('button', { name: 'Submit' });
        this.signUpButton = page.getByText('Sign up', { exact: true });
    }

    //3. public page actions(methods) / behaviour: Encapsulation
    // Because it’s just '/' (a relative path), Playwright combines it with the baseURL from your playwright.config.ts 
    async goToLoginPage() {
        await this.page.goto('/');
    }

    async getHeading(): Promise<string> {
        return (await this.heading.innerText()).trim();
    }

    async doLogin(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    async clickSignUp() {
        await this.signUpButton.click();
    }

    async isLoginFormVisible(): Promise<boolean> {
        return await this.emailInput.isVisible() && await this.passwordInput.isVisible();
    }

}
