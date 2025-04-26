import type { FlashcardProposalDto } from "@/types/flashcard.ts";

export const mockFlashcardProposal: FlashcardProposalDto = {
  front: "Sample question",
  back: "Sample answer",
};

export const mockEmptyFlashcardProposal: FlashcardProposalDto = {
  front: "",
  back: "",
};
