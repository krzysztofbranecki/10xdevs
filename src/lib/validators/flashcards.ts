import { z } from "zod";
import type { FlashcardProposalDto } from "@/types";

export const generateFlashcardsSchema = z.object({
  input_text: z
    .string()
    .min(1000, "Tekst musi zawierać co najmniej 1000 znaków")
    .max(10000, "Tekst nie może przekraczać 10000 znaków"),
  additional_options: z
    .object({
      model: z.string().optional(),
    })
    .optional(),
});

export const flashcardProposalSchema = z.object({
  front: z.string().min(1, "Przód fiszki nie może być pusty").max(500, "Przód fiszki nie może przekraczać 500 znaków"),
  back: z.string().min(1, "Tył fiszki nie może być pusty").max(1000, "Tył fiszki nie może przekraczać 1000 znaków"),
});

export const validateFlashcardProposal = (proposal: FlashcardProposalDto): { isValid: boolean; errors?: string[] } => {
  try {
    flashcardProposalSchema.parse(proposal);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map((err) => err.message),
      };
    }
    return {
      isValid: false,
      errors: ["Wystąpił nieoczekiwany błąd walidacji"],
    };
  }
};

export const validateGenerateInput = (input: string): { isValid: boolean; errors?: string[] } => {
  try {
    generateFlashcardsSchema.parse({ input_text: input });
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map((err) => err.message),
      };
    }
    return {
      isValid: false,
      errors: ["Wystąpił nieoczekiwany błąd walidacji"],
    };
  }
};
