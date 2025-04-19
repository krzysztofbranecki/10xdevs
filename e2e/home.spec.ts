import { test, expect } from "@playwright/test";
import { HomePage } from "./utils/page-object";

test.describe("Home Page", () => {
  test("should load successfully", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.goto();

    // Assert
    await homePage.assertPageLoaded();
    await expect(page).toHaveTitle(/10x/);
  });

  test("should have correct meta tags", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.goto();

    // Assert
    // Check for essential meta tags
    const descriptionMeta = page.locator('meta[name="description"]');
    await expect(descriptionMeta).toHaveAttribute("content", /.+/);
  });

  test("should take a screenshot that matches baseline", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.goto();
    await homePage.waitForPageLoad();

    // Assert - Visual comparison
    await expect(page).toHaveScreenshot("home-page.png");
  });
});
