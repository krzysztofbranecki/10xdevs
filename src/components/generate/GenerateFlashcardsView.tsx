import { useState } from "react";
import type { FlashcardProposalDto } from "@/types";
import { FlashcardProposalList } from "./FlashcardProposalList";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import { validateInputText } from "@/utils/validation";
import { toast } from "sonner";

export const GenerateFlashcardsView = () => {
  const [inputText, setInputText] = useState("");
  const [proposals, setProposals] = useState<FlashcardProposalDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      console.log("handleGenerate");
      setError(null);
      setLoading(true);

      const validationError = validateInputText(inputText);
      if (validationError) {
        setError(validationError);
        return;
      }

      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input_text: inputText }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();
      console.log("Received proposals:", data);
      setProposals(data.proposals);
      toast.success("Fiszki zostały wygenerowane!");
    } catch (err) {
      setError("Wystąpił błąd podczas generowania fiszek");
      toast.error("Wystąpił błąd podczas generowania fiszek");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);
    setError(validateInputText(value));
  };

  const handleEdit = (index: number) => {
    // This will be handled by the FlashcardProposalList component
  };

  const handleAccept = async (index: number) => {
    try {
      const proposal = proposals[index];
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proposal),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcard");
      }

      const newProposals = proposals.filter((_, i) => i !== index);
      setProposals(newProposals);
      toast.success("Fiszka została zapisana!");
    } catch (err) {
      toast.error("Wystąpił błąd podczas zapisywania fiszki");
    }
  };

  const handleDecline = (index: number) => {
    const newProposals = proposals.filter((_, i) => i !== index);
    setProposals(newProposals);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <textarea
          className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Wprowadź tekst, na podstawie którego zostaną wygenerowane fiszki..."
          value={inputText}
          onChange={handleInputChange}
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{inputText.length}/1000 znaków</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            onClick={handleGenerate}
            disabled={loading || !!error}
          >
            {loading ? "Generowanie..." : "Generuj fiszki"}
          </button>
        </div>
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      {loading && <LoadingIndicator />}

      {proposals.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Wygenerowane fiszki</h2>
          <FlashcardProposalList
            proposals={proposals}
            onEdit={handleEdit}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        </div>
      )}
    </div>
  );
};
