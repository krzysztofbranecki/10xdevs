import React, { useEffect, useState } from "react";
import FlashcardsList from "../flashcards/FlashcardsList";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface CollectionViewProps {
  collectionId: string;
}

const CollectionView: React.FC<CollectionViewProps> = ({ collectionId }) => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/collections/${collectionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        setCollection(data.collection);
        setFlashcards(data.flashcards);
        setLoading(false);
      })
      .catch(() => {
        setError("Błąd ładowania kolekcji");
        setLoading(false);
      });
  }, [collectionId]);

  if (loading) {
    return <div className="text-blue-200">Ładowanie...</div>;
  }
  if (error) {
    return <div className="text-red-400">{error}</div>;
  }
  if (!collection) {
    return <div className="text-red-400">Nie znaleziono kolekcji</div>;
  }

  return (
    <div>
      <div className="max-w-xl mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-blue-100 mb-4">{collection.name}</h2>
        <p className="text-blue-200/80 text-base mb-6">{collection.description}</p>
        <div className="flex justify-between items-center text-sm text-blue-300/70 mb-8">
          <span>{flashcards.length} fiszek</span>
          <span>Ostatnia zmiana: {collection.updated_at || collection.created_at}</span>
        </div>
        <div className="flex justify-end space-x-3">
          <a
            href="/collections"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Powrót
          </a>
        </div>
      </div>
      <div className="max-w-xl mx-auto">
        <h3 className="text-xl font-semibold text-blue-100 mb-4">Fiszki w kolekcji</h3>
        <FlashcardsList flashcards={flashcards} />
      </div>
    </div>
  );
};

export default CollectionView;
