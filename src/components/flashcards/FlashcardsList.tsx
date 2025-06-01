import React, { useState } from "react";

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

interface Props {
  flashcards: Flashcard[];
}

const FlashcardsList: React.FC<Props> = ({ flashcards }) => {
  const [cards, setCards] = useState<Flashcard[]>(flashcards);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  const startEdit = (card: Flashcard) => {
    setEditingId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFront("");
    setEditBack("");
  };

  const saveEdit = () => {
    setCards(cards.map((card) => (card.id === editingId ? { ...card, front: editFront, back: editBack } : card)));
    setEditingId(null);
    setEditFront("");
    setEditBack("");
  };

  if (cards.length === 0) {
    return <div className="text-blue-200/70 text-center py-8">Brak fiszek w tej kolekcji.</div>;
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 flex flex-col gap-2"
        >
          {editingId === card.id ? (
            <>
              <div>
                <label className="block text-blue-300 text-xs mb-1" htmlFor={`front-${card.id}`}>
                  Front
                </label>
                <input
                  id={`front-${card.id}`}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 mb-2"
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-purple-300 text-xs mb-1" htmlFor={`back-${card.id}`}>
                  Back
                </label>
                <textarea
                  id={`back-${card.id}`}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 mb-2"
                  rows={2}
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                  onClick={cancelEdit}
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  onClick={saveEdit}
                >
                  Zapisz
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="block text-blue-300 text-xs mb-1">Front</span>
                <div className="font-medium text-blue-200 mb-1">{card.front}</div>
              </div>
              <div>
                <span className="block text-purple-300 text-xs mb-1">Back</span>
                <div className="text-purple-200">{card.back}</div>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-blue-500/30 hover:bg-blue-500/50 text-blue-100 rounded-md text-xs"
                  onClick={() => startEdit(card)}
                >
                  Edytuj
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default FlashcardsList;
