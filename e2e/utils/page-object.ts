import { Page, Locator, expect } from "@playwright/test";

/**
 * Base Page Object class that all page objects should extend
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = "/") {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    // Wait for the page to be fully loaded
    await this.page.waitForLoadState("networkidle");
  }
}

/**
 * Home Page Object
 */
export class HomePage extends BasePage {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { level: 1 });
  }

  async goto() {
    await super.goto("/");
    await this.waitForPageLoad();
  }

  async assertPageLoaded() {
    await expect(this.heading).toBeVisible();
  }
}
