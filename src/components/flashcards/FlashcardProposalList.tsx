import type { FlashcardProposalDto } from "@/types";

interface FlashcardProposalListProps {
  proposals: FlashcardProposalDto[];
  onEdit: (index: number) => void;
  onAccept: (index: number) => void;
  onDecline: (index: number) => void;
}

export const FlashcardProposalList = ({
  proposals,
  onEdit,
  onAccept,
  onDecline,
}: FlashcardProposalListProps) => {
  return (
    <div className="space-y-4">
      {proposals.map((proposal, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">Propozycja {index + 1}</h3>
            <div className="space-x-2">
              <button
                onClick={() => onEdit(index)}
                className="text-blue-500 hover:text-blue-700"
              >
                Edytuj
              </button>
              <button
                onClick={() => onAccept(index)}
                className="text-green-500 hover:text-green-700"
              >
                Akceptuj
              </button>
              <button
                onClick={() => onDecline(index)}
                className="text-red-500 hover:text-red-700"
              >
                Odrzuć
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Przód:</p>
              <p>{proposal.front}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tył:</p>
              <p>{proposal.back}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 