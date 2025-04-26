import type { GenerateFlashcardsCommand, FlashcardProposalDto } from "../../types";
import { OpenRouterService, OpenRouterError, OpenRouterErrorType, type ChatMessage } from "./openrouter.service";

const SYSTEM_PROMPT = `You are a helpful assistant that generates educational flashcards. 
Given a text, you should create flashcards that help users learn and remember the key concepts.
Each flashcard should have:
1. A clear, concise question on the front
2. A detailed, accurate answer on the back
3. Focus on important concepts and facts
4. Use simple, clear language
5. Avoid overly complex questions or answers

Format your response as a JSON array of objects with 'front' and 'back' properties.`;

export type FlashcardGenerationErrorType =
  | "API_ERROR"
  | "VALIDATION_ERROR"
  | "PARSING_ERROR"
  | "NETWORK_ERROR"
  | "INSUFFICIENT_CREDITS"
  | "INVALID_API_KEY"
  | "MODEL_NOT_FOUND";

export class FlashcardGenerationError extends Error {
  constructor(
    message: string,
    public type: FlashcardGenerationErrorType,
    public details?: unknown,
    public statusCode = 500
  ) {
    super(message);
    this.name = "FlashcardGenerationError";
  }
}

export async function generateFlashcards(
  command: GenerateFlashcardsCommand
): Promise<{ proposals: FlashcardProposalDto[]; rawResponse: unknown }> {
  try {
    if (!import.meta.env.OPENROUTER_API_KEY) {
      throw new FlashcardGenerationError("OpenRouter API key is not configured", "API_ERROR", undefined, 500);
    }

    const openRouter = new OpenRouterService({
      apiKey: import.meta.env.OPENROUTER_API_KEY,
      defaultModel: command.additional_options?.model || "openai/gpt-4o-mini",
    });

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Please generate flashcards from the following text:\n\n${command.input_text}`,
      },
    ];

    let response;
    try {
      response = await openRouter.sendMessage(messages, {
        responseFormat: {
          type: "json_schema",
          json_schema: {
            name: "flashcards",
            strict: true,
            schema: {
              type: "object",
              properties: {
                flashcards: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      front: { type: "string" },
                      back: { type: "string" },
                    },
                    required: ["front", "back"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["flashcards"],
              additionalProperties: false,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof OpenRouterError) {
        // Use the status code from the error details
        const statusCode = (error.details as { status?: number })?.status || 500;

        // For validation errors, use status code 400
        if (error.type === OpenRouterErrorType.VALIDATION_ERROR) {
          throw new FlashcardGenerationError(error.message, "VALIDATION_ERROR", error.details, 400);
        }

        throw new FlashcardGenerationError(
          error.message,
          error.type as FlashcardGenerationErrorType,
          error.details,
          statusCode
        );
      }
      throw error;
    }

    let proposals: FlashcardProposalDto[];
    try {
      // Extract the JSON array from the response message
      const jsonMatch = response.message.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new FlashcardGenerationError(
          "Invalid response format: no JSON object found",
          "PARSING_ERROR",
          {
            response: response.message,
            rawResponse: response.rawResponse,
          },
          400
        );
      }
      const parsedResponse = JSON.parse(jsonMatch[0]);
      if (!parsedResponse.flashcards || !Array.isArray(parsedResponse.flashcards)) {
        throw new FlashcardGenerationError(
          "Invalid response format: missing flashcards array",
          "PARSING_ERROR",
          {
            response: parsedResponse,
            rawResponse: response.rawResponse,
          },
          400
        );
      }
      proposals = parsedResponse.flashcards as FlashcardProposalDto[];
    } catch (error) {
      throw new FlashcardGenerationError(
        "Failed to parse response from OpenRouter API",
        "PARSING_ERROR",
        {
          error,
          response: response.message,
          rawResponse: response.rawResponse,
        },
        400
      );
    }

    // Validate each proposal
    for (const proposal of proposals) {
      if (!proposal.front || !proposal.back) {
        throw new FlashcardGenerationError(
          "Invalid flashcard proposal format: missing front or back",
          "VALIDATION_ERROR",
          proposal,
          400
        );
      }
    }

    return {
      proposals,
      rawResponse: response.rawResponse,
    };
  } catch (error) {
    if (error instanceof FlashcardGenerationError) {
      throw error;
    }
    throw new FlashcardGenerationError("Unexpected error during flashcard generation", "API_ERROR", error, 500);
  }
}
