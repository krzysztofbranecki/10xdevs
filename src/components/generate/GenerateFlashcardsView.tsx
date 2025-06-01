import { useState, useEffect } from "react";
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
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  // Pobierz kolekcje użytkownika po wygenerowaniu fiszek
  useEffect(() => {
    if (proposals.length > 0) {
      setCollectionsLoading(true);
      fetch("/api/collections")
        .then((res) => res.json())
        .then((data) => {
          setCollections(data.collections || []);
          if (data.collections?.length) {
            setSelectedCollectionId(data.collections[0].id);
          }
        })
        .catch(() => setCollections([]))
        .finally(() => setCollectionsLoading(false));
    }
  }, [proposals.length]);

  const handleGenerate = async () => {
    try {
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
      setProposals(data.proposals);
      setGenerationId(data.generation_id || null);
      setSourceId(data.source_id || null);
      toast.success("Fiszki zostały wygenerowane!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Wystąpił błąd podczas generowania fiszek");
      }
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

  const handleEdit = (index: number, newProposal: FlashcardProposalDto) => {
    const newProposals = [...proposals];
    newProposals[index] = newProposal;
    setProposals(newProposals);
  };

  // Tworzenie nowej kolekcji jeśli trzeba
  const ensureCollection = async (): Promise<string | null> => {
    if (newCollectionName.trim()) {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollectionName }),
      });
      if (res.ok) {
        const data = await res.json();
        setCollections((prev) => [...prev, { id: data.id, name: data.name }]);
        setSelectedCollectionId(data.id);
        setNewCollectionName("");
        return data.id;
      } else {
        toast.error("Nie udało się utworzyć kolekcji");
        return null;
      }
    }
    return selectedCollectionId;
  };

  const handleAccept = async (index: number) => {
    try {
      const proposal = proposals[index];
      const collectionId = await ensureCollection();
      if (!collectionId) {
        toast.error("Musisz wybrać lub utworzyć kolekcję");
        return;
      }
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...proposal,
          generation_id: generationId,
          source_id: sourceId,
          collection_id: collectionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcard");
      }

      const newProposals = proposals.filter((_, i) => i !== index);
      setProposals(newProposals);
      toast.success("Fiszka została zapisana!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Wystąpił błąd podczas zapisywania fiszki");
      }
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
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Wygenerowane fiszki</h2>

          <div className="mb-4">
            <label htmlFor="collection-select" className="block text-sm font-medium mb-1">
              Kolekcja
            </label>
            {collectionsLoading ? (
              <div className="text-blue-400">Ładowanie kolekcji...</div>
            ) : (
              <>
                <select
                  id="collection-select"
                  className="w-full p-2 border rounded mb-2"
                  value={selectedCollectionId || ""}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  disabled={!!newCollectionName}
                >
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                  {!collections.length && <option value="">Brak kolekcji</option>}
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="p-2 border rounded flex-1"
                    placeholder="lub utwórz nową kolekcję..."
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    disabled={collectionsLoading}
                  />
                  {newCollectionName && (
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded"
                      onClick={async (e) => {
                        e.preventDefault();
                        await ensureCollection();
                      }}
                      disabled={collectionsLoading}
                    >
                      Utwórz
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

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
