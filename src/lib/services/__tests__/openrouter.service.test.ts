import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { OpenRouterService } from "../openrouter.service";
import type { OpenRouterConfig, ChatMessage } from "../openrouter.service";
import { OpenRouterError } from "../openrouter.service";
import type { AxiosInstance } from "axios";

vi.mock("axios", () => {
  return {
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
      })),
      isAxiosError: vi.fn(),
    },
  };
});

describe("OpenRouterService - Initialization", () => {
  let mockConfig: OpenRouterConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = {
      apiKey: "test-api-key",
    };
    vi.stubGlobal("import.meta", {
      env: {
        SITE_URL: "https://test-site.com",
        DEV: true,
      },
    });
  });

  it("should initialize with valid configuration", () => {
    // Arrange & Act
    const service = new OpenRouterService(mockConfig);

    // Assert
    expect(service).toBeInstanceOf(OpenRouterService);
    expect(axios.create).toHaveBeenCalledTimes(1);
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://openrouter.ai/api/v1",
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-key",
          "Content-Type": "application/json",
          "X-Title": "10xdevs",
        }),
      })
    );
  });

  it("should use default baseUrl when not provided", () => {
    // Arrange & Act
    new OpenRouterService(mockConfig);

    // Assert
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://openrouter.ai/api/v1",
      })
    );
  });

  it("should use custom baseUrl when provided", () => {
    // Arrange
    const configWithBaseUrl: OpenRouterConfig = {
      ...mockConfig,
      baseUrl: "https://custom-api.example.com",
    };

    // Act
    new OpenRouterService(configWithBaseUrl);

    // Assert
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://custom-api.example.com",
      })
    );
  });

  it("should use default model when not provided", () => {
    // Arrange & Act
    const service = new OpenRouterService(mockConfig);

    // Assert - The default model is only used when sending messages,
    // so we can't verify it directly at initialization
    expect(service).toBeInstanceOf(OpenRouterService);
  });

  it("should use custom model when provided", () => {
    // Arrange
    const configWithModel: OpenRouterConfig = {
      ...mockConfig,
      defaultModel: "custom-model",
    };

    // Act
    const service = new OpenRouterService(configWithModel);

    // Assert - The model is only used when sending messages,
    // so we can't verify it directly at initialization
    expect(service).toBeInstanceOf(OpenRouterService);
  });

  it("should use localhost as HTTP-Referer when SITE_URL is not available", () => {
    // Arrange
    vi.stubGlobal("import.meta", {
      env: {
        DEV: true,
      },
    });

    // Act
    new OpenRouterService(mockConfig);

    // Assert
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          "HTTP-Referer": "http://localhost:4321",
        }),
      })
    );
  });
});

describe("OpenRouterService - API Connection Verification", () => {
  let service: OpenRouterService;
  let mockAxiosGet: ReturnType<typeof vi.fn>;
  let mockConfig: OpenRouterConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = {
      apiKey: "test-api-key",
    };

    // Setup axios mock
    mockAxiosGet = vi.fn();
    (axios.create as ReturnType<typeof vi.fn>).mockReturnValue({
      get: mockAxiosGet,
      post: vi.fn(),
    } as Partial<AxiosInstance>);

    // Create service instance
    service = new OpenRouterService(mockConfig);

    // Set up axios.isAxiosError mock
    (axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockImplementation((error) => {
      return error && typeof error === "object" && "response" in error;
    });
  });

  it("should set isConnected to true on successful connection", async () => {
    // Arrange
    mockAxiosGet.mockResolvedValueOnce({ status: 200, data: { status: "ok" } });

    // Act
    await service.initializeConnection();

    // Assert
    expect(mockAxiosGet).toHaveBeenCalledWith("/health");
    expect(service.isConnectedToAPI()).toBe(true);
  });

  it("should throw an error and set isConnected to false on failed connection", async () => {
    // Arrange
    const axiosError = {
      response: {
        status: 500,
        data: { error: { message: "API connection failed" } },
      },
      message: "Request failed with status code 500",
    };
    mockAxiosGet.mockRejectedValueOnce(axiosError);

    // Act & Assert
    await expect(() => service.initializeConnection()).rejects.toThrow(OpenRouterError);
    expect(service.isConnectedToAPI()).toBe(false);
  });

  it("should handle network errors during connection check", async () => {
    // Arrange
    const networkError = new Error("Network Error");
    mockAxiosGet.mockRejectedValueOnce(networkError);

    // Act & Assert
    await expect(() => service.initializeConnection()).rejects.toThrow(OpenRouterError);
    expect(service.isConnectedToAPI()).toBe(false);
  });
});

describe("OpenRouterService - Message Sending with Retries", () => {
  let service: OpenRouterService;
  let mockAxiosPost: ReturnType<typeof vi.fn>;
  let mockConfig: OpenRouterConfig;
  let mockMessages: ChatMessage[];
  let mockSuccessResponse: {
    data: {
      id: string;
      model: string;
      created: number;
      object: string;
      choices: {
        index: number;
        message: {
          role: string;
          content: string;
        };
        finish_reason: string | null;
      }[];
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
    };
  };

  // Mock successful API response
  const createSuccessResponse = () => ({
    data: {
      id: "resp-123",
      model: "openai/gpt-4o-mini",
      created: 1625097587,
      object: "chat.completion",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "This is a test response",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = {
      apiKey: "test-api-key",
    };

    // Sample messages
    mockMessages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello, how are you?" },
    ];

    // Create success response
    mockSuccessResponse = createSuccessResponse();

    // Setup axios mock
    mockAxiosPost = vi.fn();
    (axios.create as ReturnType<typeof vi.fn>).mockReturnValue({
      get: vi.fn(),
      post: mockAxiosPost,
    } as Partial<AxiosInstance>);

    // Mock setTimeout to make tests faster
    vi.spyOn(global, "setTimeout").mockImplementation((cb) => {
      if (typeof cb === "function") cb();
      return 0 as unknown as NodeJS.Timeout;
    });

    // Create service instance
    service = new OpenRouterService(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should successfully send a message and return a valid response", async () => {
    // Arrange
    mockAxiosPost.mockResolvedValueOnce(mockSuccessResponse);

    // Act
    const result = await service.sendMessage(mockMessages);

    // Assert
    expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    expect(mockAxiosPost).toHaveBeenCalledWith("/chat/completions", {
      model: "openai/gpt-4o-mini",
      messages: mockMessages,
      response_format: undefined,
    });

    expect(result).toEqual({
      message: "This is a test response",
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
      rawResponse: mockSuccessResponse.data,
    });
  });

  it("should retry failed requests and eventually succeed", async () => {
    // Arrange
    const errorResponse = new Error("Network error");
    mockAxiosPost.mockRejectedValueOnce(errorResponse);
    mockAxiosPost.mockRejectedValueOnce(errorResponse);
    mockAxiosPost.mockResolvedValueOnce(mockSuccessResponse);

    // Act
    const result = await service.sendMessage(mockMessages, { maxRetries: 3 });

    // Assert
    expect(mockAxiosPost).toHaveBeenCalledTimes(3);
    expect(result).toEqual({
      message: "This is a test response",
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
      rawResponse: mockSuccessResponse.data,
    });
  });

  it("should throw an error after exhausting all retry attempts", async () => {
    // Arrange
    const errorResponse = new Error("Network error");
    mockAxiosPost.mockRejectedValue(errorResponse);

    // Act & Assert
    await expect(service.sendMessage(mockMessages, { maxRetries: 3 })).rejects.toThrow();
    expect(mockAxiosPost).toHaveBeenCalledTimes(3);
  });

  it("should use custom model when provided", async () => {
    // Arrange
    mockAxiosPost.mockResolvedValueOnce(mockSuccessResponse);
    const customModel = "anthropic/claude-3-opus";

    // Act
    await service.sendMessage(mockMessages, { model: customModel });

    // Assert
    expect(mockAxiosPost).toHaveBeenCalledWith("/chat/completions", {
      model: customModel,
      messages: mockMessages,
      response_format: undefined,
    });
  });

  it("should use default model from config when no model specified in options", async () => {
    // Arrange
    mockAxiosPost.mockResolvedValueOnce(mockSuccessResponse);
    const configWithModel: OpenRouterConfig = {
      ...mockConfig,
      defaultModel: "custom-default-model",
    };

    // Create new service with default model
    (axios.create as ReturnType<typeof vi.fn>).mockReturnValue({
      get: vi.fn(),
      post: mockAxiosPost,
    } as Partial<AxiosInstance>);

    const serviceWithDefaultModel = new OpenRouterService(configWithModel);

    // Act
    await serviceWithDefaultModel.sendMessage(mockMessages);

    // Assert
    expect(mockAxiosPost).toHaveBeenCalledWith("/chat/completions", {
      model: "custom-default-model",
      messages: mockMessages,
      response_format: undefined,
    });
  });
});
