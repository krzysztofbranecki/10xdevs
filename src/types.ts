/*
 * DTO and Command Model definitions for the API.
 * These definitions are derived from the database models (src/db/database.types.ts)
 * and the API Plan (ai/api-plan.md).
 */

import type { Database } from "./db/database.types";

// Flashcard DTO based on the flashcards table Row.
export type FlashcardDto = Database["public"]["Tables"]["flashcards"]["Row"];

// Pagination DTO for paginated responses.
export type PaginationDto = {
  page: number;
  per_page: number;
  total: number;
};

// DTO for listing flashcards with pagination.
export type FlashcardsListDto = {
  flashcards: FlashcardDto[];
  pagination: PaginationDto;
};

// Command model for creating a new flashcard.
// Derived from flashcards Insert type by picking only required fields for creation.
export type CreateFlashcardCommand = Pick<
  Database["public"]["Tables"]["flashcards"]["Insert"],
  "front" | "back" | "source_id" | "generation_id"
>;

// Command model for updating an existing flashcard's details.
export type UpdateFlashcardCommand = {
  front: string;
  back: string;
};

// Command model for generating flashcards using AI.
export type GenerateFlashcardsCommand = {
  input_text: string; // Expected to be between 1000 and 10000 characters.
  additional_options?: {
    model?: string;
  };
};

// DTO for an individual flashcard proposal from AI generation.
export type FlashcardProposalDto = {
  front: string;
  back: string;
};

// DTO for the result of AI flashcard generation.
export type GenerateFlashcardsResultDto = {
  proposals: FlashcardProposalDto[];
};

// Standard error response DTO.
export type ErrorResponseDto = {
  error: string;
  error_code: number;
  details?: string;
}; 