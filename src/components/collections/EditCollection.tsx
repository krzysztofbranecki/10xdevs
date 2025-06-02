import React, { useEffect, useState } from "react";

interface EditCollectionProps {
  collectionId: string;
}

const EditCollection: React.FC<EditCollectionProps> = ({ collectionId }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  if (loading) {
    return <div className="text-blue-200">Ładowanie...</div>;
  }
  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  return (
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
  );
};

export default EditCollection;
