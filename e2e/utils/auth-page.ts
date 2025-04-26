import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";
import { BasePage } from "./page-object";

export class AuthPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly signUpButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Hasło");
    this.signInButton = page.getByTestId("login-button");
    this.signUpButton = page.getByRole("button", { name: /sign up/i });
    this.errorMessage = page.locator('[data-test="auth-error"]');
  }

  async goto() {
    await super.goto("/login");
    await this.waitForPageLoad();
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async signUp(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signUpButton.click();
  }

  async expectErrorMessage(message: string | RegExp) {
    await expect(this.errorMessage).toContainText(message);
  }
}
