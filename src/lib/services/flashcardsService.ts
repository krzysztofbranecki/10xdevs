import type { GenerateFlashcardsCommand, FlashcardProposalDto } from "../../types";
import { OpenRouterService, OpenRouterError, OpenRouterErrorType } from "./openrouter.service";

const SYSTEM_PROMPT = `You are a helpful assistant that generates educational flashcards. 
Given a text, you should create flashcards that help users learn and remember the key concepts.
Each flashcard should have:
1. A clear, concise question on the front
2. A detailed, accurate answer on the back
3. Focus on important concepts and facts
4. Use simple, clear language
5. Avoid overly complex questions or answers

Format your response as a JSON array of objects with 'front' and 'back' properties.`;

export class FlashcardGenerationError extends Error {
  constructor(
    message: string,
    public type: 'API_ERROR' | 'VALIDATION_ERROR' | 'PARSING_ERROR' | 'NETWORK_ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = 'FlashcardGenerationError';
  }
}

export async function generateFlashcards(
  command: GenerateFlashcardsCommand,
  supabase: any
): Promise<FlashcardProposalDto[]> {
  try {
    if (!import.meta.env.OPENROUTER_API_KEY) {
      throw new FlashcardGenerationError(
        'OpenRouter API key is not configured',
        'API_ERROR'
      );
    }

    const openRouter = new OpenRouterService({
      apiKey: import.meta.env.OPENROUTER_API_KEY,
      defaultModel: command.additional_options?.model || "anthropic/claude-3-opus",
    });

    const messages = [
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
            type: "array",
            items: {
              type: "object",
              properties: {
                front: { type: "string" },
                back: { type: "string" },
              },
              required: ["front", "back"],
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof OpenRouterError) {
        switch (error.type) {
          case OpenRouterErrorType.API_ERROR:
            throw new FlashcardGenerationError(
              'Failed to communicate with OpenRouter API',
              'API_ERROR',
              error.details
            );
          case OpenRouterErrorType.NETWORK_ERROR:
            throw new FlashcardGenerationError(
              'Network error while communicating with OpenRouter API',
              'NETWORK_ERROR',
              error.details
            );
          case OpenRouterErrorType.RATE_LIMIT_ERROR:
            throw new FlashcardGenerationError(
              'Rate limit exceeded for OpenRouter API',
              'API_ERROR',
              error.details
            );
          default:
            throw new FlashcardGenerationError(
              'Unknown error from OpenRouter API',
              'API_ERROR',
              error.details
            );
        }
      }
      throw error;
    }

    let proposals: FlashcardProposalDto[];
    try {
      proposals = JSON.parse(response.message) as FlashcardProposalDto[];
    } catch (error) {
      throw new FlashcardGenerationError(
        'Failed to parse response from OpenRouter API',
        'PARSING_ERROR',
        error
      );
    }

    // Validate each proposal
    for (const proposal of proposals) {
      if (!proposal.front || !proposal.back) {
        throw new FlashcardGenerationError(
          'Invalid flashcard proposal format: missing front or back',
          'VALIDATION_ERROR',
          proposal
        );
      }
    }

    return proposals;
  } catch (error) {
    if (error instanceof FlashcardGenerationError) {
      throw error;
    }
    throw new FlashcardGenerationError(
      'Unexpected error during flashcard generation',
      'API_ERROR',
      error
    );
  }
} 