import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import { z } from "zod";

// Types
export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  message: string;
  confidence: number;
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  lastRequestTime: Date;
}

export enum OpenRouterErrorType {
  API_ERROR = "API_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
}

export class OpenRouterError extends Error {
  constructor(
    public type: OpenRouterErrorType,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

// Validation schemas
const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1),
});

const chatResponseSchema = z.object({
  message: z.string(),
  confidence: z.number().min(0).max(1),
});

export class OpenRouterService {
  private readonly client: AxiosInstance;
  private readonly config: OpenRouterConfig;
  private isConnected = false;
  private lastError?: OpenRouterError;
  private usageStats: UsageStats = {
    totalRequests: 0,
    totalTokens: 0,
    lastRequestTime: new Date(),
  };

  constructor(config: OpenRouterConfig) {
    this.config = {
      baseUrl: config.baseUrl || "https://openrouter.ai/api/v1",
      defaultModel: config.defaultModel || "anthropic/claude-3-opus",
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 30000,
      apiKey: config.apiKey,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      await this.client.get("/health");
      this.isConnected = true;
    } catch (error) {
      this.isConnected = false;
      this.lastError = new OpenRouterError(
        OpenRouterErrorType.API_ERROR,
        "Failed to initialize connection to OpenRouter API",
        error
      );
    }
  }

  private async validateResponse(response: unknown): Promise<boolean> {
    try {
      chatResponseSchema.parse(response);
      return true;
    } catch (error) {
      this.lastError = new OpenRouterError(
        OpenRouterErrorType.VALIDATION_ERROR,
        "Invalid response format from OpenRouter API",
        error
      );
      return false;
    }
  }

  private async handleError(error: unknown): Promise<void> {
    if (error instanceof AxiosError) {
      if (error.response?.status === 429) {
        this.lastError = new OpenRouterError(
          OpenRouterErrorType.RATE_LIMIT_ERROR,
          "Rate limit exceeded",
          error.response.data
        );
      } else if (error.code === "ECONNABORTED") {
        this.lastError = new OpenRouterError(OpenRouterErrorType.NETWORK_ERROR, "Request timeout", error);
      } else {
        this.lastError = new OpenRouterError(OpenRouterErrorType.API_ERROR, "API request failed", error);
      }
    } else {
      this.lastError = new OpenRouterError(OpenRouterErrorType.API_ERROR, "Unknown error occurred", error);
    }
  }

  private async retryRequest<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    const maxRetries = this.config.maxRetries ?? 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  public async sendMessage(
    messages: ChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      responseFormat?: {
        type: string;
        json_schema?: Record<string, unknown>;
      };
    }
  ): Promise<ChatResponse> {
    if (!this.isConnected) {
      throw new OpenRouterError(OpenRouterErrorType.API_ERROR, "Service is not connected to OpenRouter API");
    }

    try {
      // Validate messages
      for (const message of messages) {
        if (!(await this.validateMessage(message))) {
          throw this.lastError;
        }
      }

      const response = await this.retryRequest(async () => {
        const result = await this.client.post("/chat/completions", {
          model: options?.model || this.config.defaultModel,
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 1000,
          response_format: options?.responseFormat,
        });

        return result.data;
      });

      if (!(await this.validateResponse(response))) {
        throw this.lastError;
      }

      this.usageStats.totalRequests++;
      this.usageStats.lastRequestTime = new Date();

      return {
        message: response.message,
        confidence: response.confidence,
      };
    } catch (error) {
      await this.handleError(error);
      throw this.lastError;
    }
  }

  public async validateMessage(message: ChatMessage): Promise<boolean> {
    try {
      chatMessageSchema.parse(message);
      return true;
    } catch (error) {
      this.lastError = new OpenRouterError(OpenRouterErrorType.VALIDATION_ERROR, "Invalid message format", error);
      return false;
    }
  }

  public getUsageStats(): UsageStats {
    return { ...this.usageStats };
  }

  public getLastError(): OpenRouterError | undefined {
    return this.lastError;
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
