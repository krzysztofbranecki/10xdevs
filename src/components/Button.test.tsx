import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button Component", () => {
  it("renders with default props", () => {
    // Arrange
    render(<Button>Click me</Button>);

    // Act
    const button = screen.getByRole("button", { name: /click me/i });

    // Assert
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-primary");
  });

  it("applies different variants correctly", () => {
    // Arrange
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);

    // Act & Assert
    expect(screen.getByRole("button")).toHaveClass("bg-gray-200");

    // Test outline variant
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveClass("border-gray-300");
  });

  it("handles click events", () => {
    // Arrange
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    // Act
    fireEvent.click(screen.getByRole("button"));

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies different sizes correctly", () => {
    // Arrange
    const { rerender } = render(<Button size="sm">Small</Button>);

    // Act & Assert
    expect(screen.getByRole("button")).toHaveClass("h-8");

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-10");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-12");
  });

  it("should be disabled when disabled prop is true", () => {
    // Arrange
    render(<Button disabled>Disabled</Button>);

    // Act
    const button = screen.getByRole("button");

    // Assert
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");
  });
});
