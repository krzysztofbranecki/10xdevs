import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Runs after each test to clean up the DOM
afterEach(() => {
  cleanup();
});

// Set global testing timeouts if needed
// vi.setConfig({ testTimeout: 10000 });
