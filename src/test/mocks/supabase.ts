import { vi } from "vitest";

export const createMockSupabaseClient = () => {
  // Create a mock Supabase client with common methods
  return {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      data: null,
      error: null,
      then: vi.fn((callback) => callback({ data: [], error: null })),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id", email: "test@example.com" } },
        error: null,
      }),
      signIn: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockImplementation((callback) => {
        // Call the callback with a mock auth change event
        callback("SIGNED_IN", { user: { id: "test-user-id", email: "test@example.com" } });
        // Return unsubscribe function
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: "test-file.jpg" }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://example.com/test-file.jpg" } }),
      }),
    },
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  };
};

// For convenience, create an instance of the mock
export const mockSupabaseClient = createMockSupabaseClient();
