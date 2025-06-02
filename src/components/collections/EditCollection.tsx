import React, { useEffect, useState } from "react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface EditCollectionProps {
  collectionId: string;
}

const EditCollection: React.FC<EditCollectionProps> = ({ collectionId }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [unassigned, setUnassigned] = useState<Flashcard[]>([]);
  const [assigned, setAssigned] = useState<Flashcard[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

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
        setName(data.collection.name || "");
        setDescription(data.collection.description || "");
        setUnassigned(data.unassignedFlashcards || []);
        setAssigned(data.flashcards || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Błąd ładowania kolekcji");
        setLoading(false);
      });
  }, [collectionId]);

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        window.location.href = "/collections";
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Błąd zapisu zmian");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Błąd sieci lub serwera");
    }
  };

  const handleAssign = async (flashcardId: string) => {
    setAssigning(flashcardId);
    setAssignError(null);
    try {
      const res = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection_id: collectionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAssignError(data.error || "Błąd przypisywania fiszki");
        setAssigning(null);
        return;
      }
      setUnassigned((prev) => prev.filter((f) => f.id !== flashcardId));
      const foundAssign = unassigned.find((f) => f.id === flashcardId);
      if (foundAssign) setAssigned((prev) => [...prev, foundAssign]);
      setAssigning(null);
    } catch {
      setAssignError("Błąd sieci lub serwera");
      setAssigning(null);
    }
  };

  const handleRemove = async (flashcardId: string) => {
    setRemoving(flashcardId);
    setRemoveError(null);
    try {
      const res = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection_id: null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRemoveError(data.error || "Błąd usuwania fiszki z kolekcji");
        setRemoving(null);
        return;
      }
      setAssigned((prev) => prev.filter((f) => f.id !== flashcardId));
      const foundRemove = assigned.find((f) => f.id === flashcardId);
      if (foundRemove) setUnassigned((prev) => [...prev, foundRemove]);
      setRemoving(null);
    } catch {
      setRemoveError("Błąd sieci lub serwera");
      setRemoving(null);
    }
  };

  return (
    <>
      {loading ? (
        <div className="text-blue-200">Ładowanie...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <>
          <form
            className="max-w-xl mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 shadow-lg"
            onSubmit={handleSubmit}
          >
            <div className="mb-6">
              <label htmlFor="name" className="block text-blue-100 font-medium mb-2">
                Nazwa kolekcji
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="description" className="block text-blue-100 font-medium mb-2">
                Opis kolekcji
              </label>
              <textarea
                id="description"
                name="description"
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <a
                href="/collections"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Anuluj
              </a>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Zapisz zmiany
              </button>
            </div>
            {success && <div className="text-green-400 mt-4">Zapisano zmiany!</div>}
          </form>

          <div className="max-w-xl mx-auto mt-10">
            <h3 className="text-xl font-semibold text-blue-100 mb-4">Fiszki w tej kolekcji</h3>
            {removeError && <div className="text-red-400 mb-2">{removeError}</div>}
            {assigned.length === 0 ? (
              <div className="text-blue-300">Brak fiszek w tej kolekcji.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {assigned.map((f) => (
                  <li key={f.id} className="flex items-center justify-between py-2">
                    <span>
                      <span className="font-medium text-blue-100">{f.front}</span>
                      <span className="mx-2 text-blue-300">→</span>
                      <span className="text-blue-200">{f.back}</span>
                    </span>
                    <button
                      className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
                      onClick={() => handleRemove(f.id)}
                      disabled={removing === f.id}
                    >
                      {removing === f.id ? "Usuwanie..." : "Usuń z kolekcji"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="max-w-xl mx-auto mt-10">
            <h3 className="text-xl font-semibold text-blue-100 mb-4">Nieprzypisane fiszki</h3>
            {assignError && <div className="text-red-400 mb-2">{assignError}</div>}
            {unassigned.length === 0 ? (
              <div className="text-blue-300">Brak nieprzypisanych fiszek.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {unassigned.map((f) => (
                  <li key={f.id} className="flex items-center justify-between py-2">
                    <span>
                      <span className="font-medium text-blue-100">{f.front}</span>
                      <span className="mx-2 text-blue-300">→</span>
                      <span className="text-blue-200">{f.back}</span>
                    </span>
                    <button
                      className="ml-4 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm"
                      onClick={() => handleAssign(f.id)}
                      disabled={assigning === f.id}
                    >
                      {assigning === f.id ? "Dodawanie..." : "Dodaj do kolekcji"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default EditCollection;
