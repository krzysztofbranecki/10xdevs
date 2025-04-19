/*
 * DTO and Command Model definitions for the API.
 * These definitions are derived from the database models (src/db/database.types.ts)
 * and the API Plan (ai/api-plan.md).
 */

import type { Database } from "./db/database.types";

// Flashcard DTO based on the flashcards table Row.
export type FlashcardDto = Database["public"]["Tables"]["flashcards"]["Row"];

// Pagination DTO for paginated responses.
export interface PaginationDto {
  page: number;
  per_page: number;
  total: number;
}

// DTO for listing flashcards with pagination.
export interface FlashcardsListDto {
  flashcards: FlashcardDto[];
  pagination: PaginationDto;
}

// Command model for creating a new flashcard.
// Derived from flashcards Insert type by picking only required fields for creation.
export type CreateFlashcardCommand = Pick<
  Database["public"]["Tables"]["flashcards"]["Insert"],
  "front" | "back" | "source_id" | "generation_id"
>;

// Command model for updating an existing flashcard's details.
export interface UpdateFlashcardCommand {
  front: string;
  back: string;
}

// Command model for generating flashcards using AI.
export interface GenerateFlashcardsCommand {
  input_text: string; // Expected to be between 1000 and 10000 characters.
  additional_options?: {
    model?: string;
  };
}

// DTO for an individual flashcard proposal from AI generation.
export interface FlashcardProposalDto {
  front: string;
  back: string;
}

// DTO for the result of AI flashcard generation.
export interface GenerateFlashcardsResultDto {
  proposals: FlashcardProposalDto[];
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
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

// Standard error response DTO.
export interface ErrorResponseDto {
  error: string;
  error_code: number;
  details?: string;
}
