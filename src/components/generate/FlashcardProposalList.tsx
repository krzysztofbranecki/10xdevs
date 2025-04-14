import type { FlashcardProposalDto } from "@/types";
import { FlashcardProposalCard } from "./FlashcardProposalCard";

interface FlashcardProposalListProps {
  proposals: FlashcardProposalDto[];
  onEdit: (index: number, newProposal: FlashcardProposalDto) => void;
  onAccept: (index: number) => void;
  onDecline: (index: number) => void;
}

export function FlashcardProposalList({
  proposals,
  onEdit,
  onAccept,
  onDecline,
}: FlashcardProposalListProps) {
  if (proposals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Wygenerowane fiszki</h2>
      <div className="grid gap-4">
        {proposals.map((proposal, index) => (
          <FlashcardProposalCard
            key={index}
            proposal={proposal}
            index={index}
            onEdit={onEdit}
            onAccept={onAccept}
            onDecline={onDecline}
          />
        ))}
      </div>
    </div>
  );
} 