import React, { useEffect, useState, useRef } from "react";
export interface CollectionRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  cardCount: number;
  lastModified: string;
}

interface CollectionsManagerProps {
  user: { id: string; email: string } | null;
}

const CollectionsManager: React.FC<CollectionsManagerProps> = ({ user }) => {
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data.collections)) throw new Error("Invalid data");
        setCollections(data.collections);
        setLoading(false);
      })
      .catch(() => {
        setError("Błąd ładowania kolekcji");
        setLoading(false);
      });
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const name = nameRef.current?.value.trim() || "";
    const description = descRef.current?.value.trim() || "";
    if (!name) {
      setAddError("Nazwa kolekcji jest wymagana");
      return;
    }
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Błąd dodawania kolekcji");
        return;
      }
      setLoading(true);
      fetch("/api/collections")
        .then((res) => res.json())
        .then((data) => {
          if (!Array.isArray(data.collections)) throw new Error("Invalid data");
          setCollections(data.collections);
          setLoading(false);
        })
        .catch(() => {
          setError("Błąd ładowania kolekcji");
          setLoading(false);
        });
      if (nameRef.current) nameRef.current.value = "";
      if (descRef.current) descRef.current.value = "";
    } catch {
      setAddError("Błąd sieci lub serwera");
    }
  };

  const handleDelete = async () => {
    setDeleteError(null);
    if (!collectionToDelete) return;
    try {
      const res = await fetch(`/api/collections/${collectionToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Błąd usuwania kolekcji");
        return;
      }
      setCollections((prev) => prev.filter((c) => c.id !== collectionToDelete));
      setShowModal(false);
      setCollectionToDelete(null);
    } catch {
      setDeleteError("Błąd sieci lub serwera");
      setShowModal(false);
      setCollectionToDelete(null);
    }
  };

  return (
    <div>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <form
        onSubmit={handleAdd}
        className="mb-8 flex flex-col gap-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
      >
        <div>
          <label htmlFor="collectionName" className="block text-blue-100 font-medium mb-1">
            Nazwa kolekcji
          </label>
          <input
            id="collectionName"
            name="name"
            type="text"
            ref={nameRef}
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="collectionDescription" className="block text-blue-100 font-medium mb-1">
            Opis kolekcji
          </label>
          <textarea
            id="collectionDescription"
            name="description"
            ref={descRef}
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={2}
            maxLength={500}
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
          >
            Dodaj kolekcję
          </button>
        </div>
        {addError && <div className="text-red-400 mt-2">{addError}</div>}
      </form>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
          Twoje kolekcje
        </h2>
      </div>

      {loading ? (
        <div className="text-blue-200">Ładowanie...</div>
      ) : collections.length === 0 ? (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 text-center py-10">
          <p className="text-blue-100 mb-4">Nie masz jeszcze żadnych kolekcji fiszek.</p>
          <a
            href="/collections/create"
            className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300"
          >
            Stwórz pierwszą kolekcję
          </a>
        </div>
      ) : (
        collections.map((collection) => (
          <div
            key={collection.id}
            className="collection-item mb-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:border-white/20"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg text-blue-100">{collection.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setCollectionToDelete(collection.id);
                    setShowModal(true);
                  }}
                  className="text-red-400 hover:text-red-300 p-1 rounded-md transition-colors"
                  title="Usuń kolekcję"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
                <a
                  href={`/collections/edit/${collection.id}`}
                  className="text-blue-400 hover:text-blue-300 p-1 rounded-md transition-colors"
                  title="Edytuj kolekcję"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <p className="text-blue-200/80 text-sm mb-4">{collection.description}</p>
            <div className="flex justify-between items-center text-xs text-blue-300/70 mb-5">
              <span>{collection.cardCount} fiszek</span>
              <span>Ostatnia zmiana: {collection.lastModified}</span>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 flex justify-between">
              <a
                href={`/collections/study/${collection.id}`}
                className="px-3 py-1.5 bg-gradient-to-r from-green-500/80 to-teal-500/80 hover:from-green-500 hover:to-teal-500 text-white rounded-lg transition-colors text-sm"
              >
                Ucz się
              </a>
              <a
                href={`/collections/view/${collection.id}`}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
              >
                Przeglądaj
              </a>
            </div>
          </div>
        ))
      )}

      {/* Modal potwierdzenia usunięcia */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-white/10 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Potwierdź usunięcie</h3>
            <p className="text-blue-100 mb-6">
              Czy na pewno chcesz usunąć tę kolekcję fiszek? Tej operacji nie można cofnąć.
            </p>
            {deleteError && <div className="text-red-400 mb-2">{deleteError}</div>}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setCollectionToDelete(null);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsManager;
