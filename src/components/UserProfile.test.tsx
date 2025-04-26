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

  // New test for when data.user is null but no error occurs (covers line 38)
  it("shows 'Not signed in' when no user is returned but no error occurs", async () => {
    // Arrange
    mockSupabaseClient.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    });

    // Act
    render(<UserProfile supabaseClient={mockSupabaseClient} />);

    // Assert
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Not signed in")).toBeInTheDocument();
    });
  });

  // New test for when user becomes null after sign out (covers line 57)
  it("sets user to null after successful sign out", async () => {
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

    mockSupabaseClient.auth.signOut = vi.fn().mockImplementation(() => {
      return Promise.resolve({ error: null });
    });

    // Act
    render(<UserProfile supabaseClient={mockSupabaseClient} />);

    await waitFor(() => {
      expect(screen.getByText("User Profile")).toBeInTheDocument();
    });

    // First verify the user profile is shown
    expect(screen.getByText(/test-user-id/)).toBeInTheDocument();

    // Then sign out
    fireEvent.click(screen.getByText("Sign Out"));

    // Assert user becomes null (showing "Not signed in")
    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Not signed in")).toBeInTheDocument();
    });

    // Ensure the previous user data is no longer shown
    expect(screen.queryByText(/test-user-id/)).not.toBeInTheDocument();
  });

  // New test for user with name property (covers lines 88-90)
  it("displays user name when present", async () => {
    // Act - directly render with a user that has a name property
    mockSupabaseClient.auth.getUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "test-user-id",
          email: "user@example.com",
          name: "Test User",
        },
      },
      error: null,
    });

    render(<UserProfile supabaseClient={mockSupabaseClient} />);

    // Assert - check that all user properties are displayed
    await waitFor(() => {
      expect(screen.getByText("User Profile")).toBeInTheDocument();
      expect(screen.getByText(/test-user-id/)).toBeInTheDocument();
      expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/Test User/)).toBeInTheDocument();
    });
  });
});
