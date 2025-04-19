import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { UserProfile } from "./UserProfile";
import { mockSupabaseClient } from "../test/mocks/supabase";

describe("UserProfile Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("displays user information when user is authenticated", async () => {
    // Arrange
    mockSupabaseClient.auth.getUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "test-user-id",
          email: "user@example.com",
        },
      },
      error: null,
    });

    // Act
    render(<UserProfile supabaseClient={mockSupabaseClient} />);

    // Assert
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("User Profile")).toBeInTheDocument();
    });

    expect(screen.getByText(/test-user-id/)).toBeInTheDocument();
    expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
  });

  it("displays error message when authentication fails", async () => {
    // Arrange
    mockSupabaseClient.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: null },
      error: { message: "Authentication failed" },
    });

    // Act
    render(<UserProfile supabaseClient={mockSupabaseClient} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Authentication failed")).toBeInTheDocument();
    });
  });

  it("handles sign out process", async () => {
    // Arrange
    mockSupabaseClient.auth.getUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "test-user-id",
          email: "user@example.com",
        },
      },
      error: null,
    });

    mockSupabaseClient.auth.signOut = vi.fn().mockResolvedValue({
      error: null,
    });

    // Act
    render(<UserProfile supabaseClient={mockSupabaseClient} />);

    await waitFor(() => {
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Sign Out"));

    // Assert
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("Not signed in")).toBeInTheDocument();
    });
  });

  it("handles sign out error", async () => {
    // Arrange
    mockSupabaseClient.auth.getUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "test-user-id",
          email: "user@example.com",
        },
      },
      error: null,
    });

    mockSupabaseClient.auth.signOut = vi.fn().mockResolvedValue({
      error: { message: "Failed to sign out" },
    });

    // Act
    render(<UserProfile supabaseClient={mockSupabaseClient} />);

    await waitFor(() => {
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Sign Out"));

    // Assert
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to sign out")).toBeInTheDocument();
    });
  });
});
