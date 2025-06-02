import React, { useState, useEffect } from "react";

const CreateFlashcard: React.FC = () => {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    setLoading(true);
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front, back }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Błąd dodawania fiszki");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setFront("");
      setBack("");
      setLoading(false);
    } catch {
      setError("Błąd sieci lub serwera");
      setLoading(false);
    }
  };

  return (
    <form
      className="max-w-xl mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 shadow-lg"
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <label htmlFor="front" className="block text-blue-100 font-medium mb-2">
          Przód fiszki
        </label>
        <input
          id="front"
          name="front"
          type="text"
          className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="back" className="block text-blue-100 font-medium mb-2">
          Tył fiszki
        </label>
        <input
          id="back"
          name="back"
          type="text"
          className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={back}
          onChange={(e) => setBack(e.target.value)}
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
          disabled={loading}
        >
          Dodaj fiszkę
        </button>
      </div>
      {success && <div className="text-green-400 mt-4">Dodano fiszkę!</div>}
      {error && <div className="text-red-400 mt-4">{error}</div>}
    </form>
  );
};

export default CreateFlashcard;
