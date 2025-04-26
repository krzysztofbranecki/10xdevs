# Testing Guidelines

This project uses two types of testing to ensure code quality:

1. **Unit Tests** - Using Vitest and React Testing Library
2. **E2E Tests** - Using Playwright

## Unit Testing

Unit tests are located in the same directory as the component they're testing, with a `.test.tsx` or `.spec.tsx` suffix.

### Running Unit Tests

```bash
# Run all tests once
yarn test

# Watch mode for development
yarn test:watch

# Open UI mode for test visualization
yarn test:ui

# Generate coverage report
yarn test:coverage
```

### Guidelines for Writing Unit Tests

- Follow the 'Arrange', 'Act', 'Assert' pattern
- Use descriptive test names that explain the expected behavior
- Use `vi.fn()` for mocking functions
- Use `vi.spyOn()` to monitor existing functions
- Group related tests with `describe` blocks
- Use inline snapshots for complex assertions (`expect(value).toMatchInlineSnapshot()`)

### Testing Components with Supabase

When testing components that interact with Supabase:

1. Use the mock Supabase client from `src/test/mocks/supabase.ts`
2. Customize the mock responses to test different scenarios
3. Verify that the component handles loading states, success, and error cases

Example:

```tsx
import { mockSupabaseClient } from "../test/mocks/supabase";

// Customize the mock for your test
mockSupabaseClient.auth.getUser = vi.fn().mockResolvedValue({
  data: { user: { id: "test-id", email: "test@example.com" } },
  error: null,
});

// Render your component with the mock client
render(<YourComponent supabaseClient={mockSupabaseClient} />);
```

## Integration Testing

Integration tests verify that multiple components work together correctly, including backend interactions.

### Guidelines for Integration Tests

- Test realistic user flows from end to end within the frontend
- Mock backend API responses to simulate different scenarios
- Test both success and error paths
- Verify that data is displayed correctly and UI updates appropriately

## E2E Testing

E2E tests are located in the `e2e` directory and use the Page Object Model pattern.

### Running E2E Tests

```bash
# Run all E2E tests
yarn test:e2e

# Run E2E tests with UI
yarn test:e2e:ui

# Generate tests using codegen
yarn test:e2e:codegen
```

### Guidelines for Writing E2E Tests

- Use the Page Object Model for maintainable tests
- Create page objects in `e2e/utils/page-object.ts`
- Use locators for resilient element selection
- Implement visual comparison for UI testing
- Handle browser contexts for isolating test environments
- Use trace viewer for debugging test failures

### Authentication in E2E Tests

For tests that require authentication:

1. Use storage state to preserve authentication between tests
2. Create a separate test for the login flow
3. For tests that assume the user is logged in, use setup steps to authenticate before the test starts

Example:

```typescript
// Save authentication state
test("authenticate user", async ({ page, context }) => {
  const authPage = new AuthPage(page);
  await authPage.goto();
  await authPage.signIn("test@example.com", "password");

  // Save authenticated state to reuse in other tests
  await context.storageState({ path: "./e2e/.auth/user.json" });
});

// Use saved authentication in other tests
test.use({ storageState: "./e2e/.auth/user.json" });
test("access authenticated page", async ({ page }) => {
  // Test starts with user already authenticated
});
```
