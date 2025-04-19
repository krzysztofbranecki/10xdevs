import { test, expect } from "@playwright/test";
import { AuthPage } from "./utils/auth-page";
import { HomePage } from "./utils/page-object";

test.describe("Authentication Flow", () => {
  test("should show error message for invalid credentials", async ({ page }) => {
    // Arrange
    const authPage = new AuthPage(page);

    // Act
    await authPage.goto();
    await authPage.signIn("invalid@example.com", "wrongpassword");

    // Assert - We mock a simple check for an error message
    // In real tests, this would interact with the actual Supabase auth
    await authPage.expectErrorMessage(/invalid/i);
  });

  test("should redirect to home page after successful login", async ({ page }) => {
    // Arrange
    const authPage = new AuthPage(page);
    const homePage = new HomePage(page);

    // This test would normally use a test account with real credentials
    // For demonstration, we're showing the test structure

    // Act
    await authPage.goto();

    // This would be a real login in an actual test
    // Note: For real tests, consider using Playwright's storage state to preserve auth
    await authPage.signIn("test@example.com", "password123");

    // Assert
    // This assumes successful login redirects to home page
    await homePage.assertPageLoaded();

    // This page object should have a "profile" locator in a real test
    // which checks if the user profile info is visible after login
    await expect(page).toHaveURL(/\/$/);
  });

  test("visual regression test of login page", async ({ page }) => {
    // Arrange
    const authPage = new AuthPage(page);

    // Act
    await authPage.goto();

    // Assert - Compare the login page appearance with baseline
    await expect(page).toHaveScreenshot("login-page.png");
  });
});
