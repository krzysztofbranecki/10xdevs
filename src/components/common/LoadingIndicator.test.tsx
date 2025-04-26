import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingIndicator } from "./LoadingIndicator.tsx";

describe("LoadingIndicator", () => {
  it("renders the loading spinner with appropriate accessibility attributes", () => {
    render(<LoadingIndicator />);

    // Check if the spinner container is in the document with correct attributes
    const spinnerContainer = screen.getByRole("status");
    expect(spinnerContainer).toBeInTheDocument();
    expect(spinnerContainer).toHaveAttribute("aria-live", "polite");

    // Check if the spinner element has the correct classes
    const spinner = spinnerContainer.querySelector(".animate-spin");
    expect(spinner).toHaveClass("rounded-full");
    expect(spinner).toHaveClass("border-blue-500");

    // Check if screen reader text is present
    const srOnlyText = screen.getByText("Loading...");
    expect(srOnlyText).toHaveClass("sr-only");
  });

  it("matches snapshot", () => {
    const { container } = render(<LoadingIndicator />);
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        aria-live="polite"
        class="flex justify-center items-center"
        role="status"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
        />
        <span
          class="sr-only"
        >
          Loading...
        </span>
      </div>
    `);
  });
});
