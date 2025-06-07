import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UserProfile from "./UserProfile";

describe("UserProfile Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("displays user information when user is authenticated", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (url === "/api/profile") {
        return Promise.resolve(
          new Response(JSON.stringify({ id: "test-user-id", email: "user@example.com" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });

    // Act
    render(<UserProfile />);

    // Assert
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("User Profile")).toBeInTheDocument();
      expect(screen.getByText(/test-user-id/)).toBeInTheDocument();
      expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
    });
  });

  it("displays error message when fetch fails", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (url === "/api/profile") {
        return Promise.resolve(
          new Response(JSON.stringify({ error: "Authentication failed" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          })
        );
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });

    // Act
    render(<UserProfile />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Authentication failed")).toBeInTheDocument();
    });
  });

  it("handles sign out process", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockImplementation((url, options) => {
      if (url === "/api/profile") {
        return Promise.resolve(
          new Response(JSON.stringify({ id: "test-user-id", email: "user@example.com" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }
      if (url === "/api/logout" && options?.method === "POST") {
        return Promise.resolve(new Response(null, { status: 200 }));
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    // @ts-expect-error: window.location is being replaced for test purposes
    delete window.location;
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
      configurable: true,
    });

    // Act
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Sign Out"));

    // Assert
    await waitFor(() => {
      expect(window.location.href).toBe("/login");
    });
  });

  it("handles sign out error", async () => {
    // Arrange
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {
      // Suppress error output during test
    });
    vi.spyOn(global, "fetch").mockImplementation((url, options) => {
      if (url === "/api/profile") {
        return Promise.resolve(
          new Response(JSON.stringify({ id: "test-user-id", email: "user@example.com" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }
      if (url === "/api/logout" && options?.method === "POST") {
        // Simulate network error
        throw new Error("Failed to sign out");
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });

    // Act
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Sign Out"));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Błąd wylogowania")).toBeInTheDocument();
    });
    errorSpy.mockRestore();
  });

  it("shows 'Not signed in' when no user is returned but no error occurs", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (url === "/api/profile") {
        return Promise.resolve(
          new Response("null", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });

    // Act
    render(<UserProfile />);

    // Assert
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Not signed in")).toBeInTheDocument();
    });
  });

  it("displays user name when present", async () => {
    // Arrange
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (url === "/api/profile") {
        return Promise.resolve(
          new Response(JSON.stringify({ id: "test-user-id", email: "user@example.com", name: "Test User" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });

    // Act
    render(<UserProfile />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("User Profile")).toBeInTheDocument();
      expect(screen.getByText(/test-user-id/)).toBeInTheDocument();
      expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/Test User/)).toBeInTheDocument();
    });
  });
});
