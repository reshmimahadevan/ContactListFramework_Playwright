import { Page, Locator } from "@playwright/test";

export class BasePage {

    protected readonly page: Page;
    protected readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.errorMessage = page.locator('#error');
    }

    async getPageTitle(): Promise<string> {
        return await this.page.title();
    }

    getPageCurrentURL(): string {
        return this.page.url();
    }

    //the app shows login / validation errors in <div id="error">: wait until the text is there
    async getErrorMessage(): Promise<string> {
        await this.errorMessage.waitFor({ state: 'visible' });
        return (await this.errorMessage.innerText()).trim();
    }

}
