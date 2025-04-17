import type { AxiosInstance } from "axios";
import axios from "axios";
import { z } from "zod";

// Types
export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  message: string;
  usage: UsageStats;
  rawResponse?: {
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
    usage: UsageStats;
  };
}

export interface UsageStats {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export enum OpenRouterErrorType {
  API_ERROR = "API_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS",
  INVALID_API_KEY = "INVALID_API_KEY",
  MODEL_NOT_FOUND = "MODEL_NOT_FOUND",
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public type: OpenRouterErrorType,
    public details?: unknown
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

// Validation schemas
const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

const chatResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  created: z.number(),
  object: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.string(),
        content: z.string(),
      }),
      finish_reason: z.string().nullable(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export class OpenRouterService {
  private client: AxiosInstance;
  private isConnected = false;

  constructor(private config: OpenRouterConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl || "https://openrouter.ai/api/v1",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "HTTP-Referer": import.meta.env.SITE_URL || "http://localhost:4321",
        "X-Title": "10xdevs",
        "Content-Type": "application/json",
      },
    });
  }

  async initializeConnection(): Promise<void> {
    try {
      await this.client.get("/health");
      this.isConnected = true;
    } catch (error) {
      this.isConnected = false;
      throw new OpenRouterError("Failed to connect to OpenRouter API", OpenRouterErrorType.API_ERROR, error);
    }
  }

  private validateResponse(response: unknown): ChatResponse {
    try {
      console.log("Raw response from OpenRouter:", response);

      if (!response || typeof response !== "object") {
        throw new OpenRouterError("Invalid response format from OpenRouter API", OpenRouterErrorType.VALIDATION_ERROR, {
          error: "Response is not an object",
          response,
          status: 400,
        });
      }

      // First check if it's an error response
      if ("error" in response) {
        const errorResponse = response as { error: { message?: string } };
        throw new OpenRouterError(
          errorResponse.error?.message || "OpenRouter API error",
          OpenRouterErrorType.API_ERROR,
          response
        );
      }

      const validated = chatResponseSchema.parse(response);

      if (!validated.choices?.[0]?.message?.content) {
        throw new OpenRouterError(
          "Invalid response format from OpenRouter API: missing message content",
          OpenRouterErrorType.VALIDATION_ERROR,
          {
            error: "Missing message content",
            response: validated,
            status: 400,
          }
        );
      }

      // Extract the message content, handling both JSON and plain text responses
      let messageContent = validated.choices[0].message.content;

      // If the content starts with "Here is a JSON array", try to parse it as JSON
      if (messageContent.startsWith("Here is a JSON array")) {
        try {
          // Extract the JSON part from the response
          const jsonMatch = messageContent.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            messageContent = jsonMatch[0];
          }
        } catch (e) {
          console.warn("Failed to parse JSON from response:", e);
        }
      }

      return {
        message: messageContent,
        usage: validated.usage,
        rawResponse: validated,
      };
    } catch (error) {
      console.error("Validation error:", error);
      console.error("Response:", response);

      if (error instanceof z.ZodError) {
        throw new OpenRouterError("Invalid response format from OpenRouter API", OpenRouterErrorType.VALIDATION_ERROR, {
          error: error.errors,
          response,
          status: 400,
        });
      }

      throw new OpenRouterError("Invalid response format from OpenRouter API", OpenRouterErrorType.VALIDATION_ERROR, {
        error,
        response,
        status: 400,
      });
    }
  }

  private async handleError(error: unknown): Promise<never> {
    console.log("OpenRouter handleError:", error);

    if (axios.isAxiosError(error)) {
      console.log("Axios error details:", {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        console.log("OpenRouter error response:", {
          status,
          data,
        });

        // Return the error response directly with proper status code
        throw new OpenRouterError(data.error?.message || "OpenRouter API error", OpenRouterErrorType.API_ERROR, {
          ...data,
          status,
        });
      }

      if (error.request) {
        console.log("Network error details:", error.request);
        throw new OpenRouterError(
          "Network error while communicating with OpenRouter API",
          OpenRouterErrorType.NETWORK_ERROR,
          {
            error,
            status: 500,
          }
        );
      }
      throw new OpenRouterError("Error setting up request to OpenRouter API", OpenRouterErrorType.API_ERROR, {
        error,
        status: 500,
      });
    }

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      console.log("Zod validation error:", error.errors);
      throw new OpenRouterError("Invalid response format from OpenRouter API", OpenRouterErrorType.VALIDATION_ERROR, {
        error,
        status: 400,
      });
    }

    throw new OpenRouterError(
      "Unexpected error while communicating with OpenRouter API",
      OpenRouterErrorType.API_ERROR,
      {
        error,
        status: 500,
      }
    );
  }

  async sendMessage(
    messages: ChatMessage[],
    options: {
      model?: string;
      maxRetries?: number;
      responseFormat?: {
        type: "json_schema";
        json_schema: {
          name: string;
          strict: boolean;
          schema: Record<string, unknown>;
        };
      };
    } = {}
  ): Promise<ChatResponse> {
    try {
      // Validate messages
      messages.forEach((message) => {
        chatMessageSchema.parse(message);
      });

      const maxRetries = options.maxRetries ?? 3;
      let lastError: unknown;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await this.client.post("/chat/completions", {
            model: options.model || this.config.defaultModel || "openai/gpt-4o-mini",
            messages,
            response_format: options.responseFormat
              ? {
                  type: "json_schema",
                  json_schema: {
                    name: "flashcards",
                    strict: true,
                    schema: options.responseFormat.json_schema.schema,
                  },
                }
              : undefined,
          });

          return this.validateResponse(response.data);
        } catch (error) {
          lastError = error;
          if (attempt < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }

      throw lastError;
    } catch (error) {
      return this.handleError(error);
    }
  }

  getUsageStats(): UsageStats | null {
    return null; // Implement if needed
  }

  isConnectedToAPI(): boolean {
    return this.isConnected;
  }
}
