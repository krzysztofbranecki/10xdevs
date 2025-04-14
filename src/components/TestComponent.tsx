import { useState } from "react";

export default function TestComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Testowy komponent React</h2>
      <p className="mb-4">Licznik: {count}</p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => setCount(count + 1)}
      >
        Zwiększ licznik
      </button>
    </div>
  );
} 