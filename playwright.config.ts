import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["list"]],
  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Take screenshots on test failures
    screenshot: "only-on-failure",
  },
  // Only use Chromium for tests as specified in the rules
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Web server to run before starting the tests
  webServer: {
    command:
      "SUPABASE_URL=https://example.com SUPABASE_KEY=mock-key OPENROUTER_API_URL=https://example.com OPENROUTER_API_KEY=mock-key yarn build && SUPABASE_URL=https://example.com SUPABASE_KEY=mock-key OPENROUTER_API_URL=https://example.com OPENROUTER_API_KEY=mock-key npx astro dev --host",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
  },
});
