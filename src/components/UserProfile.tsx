import React, { useEffect, useState } from "react";
import { Button } from "./Button";

interface User {
  id: string;
  email?: string;
  name?: string;
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/profile");
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Błąd pobierania profilu");
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      setError("Błąd wylogowania");
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="p-4 text-center">Not signed in</div>;
  }

  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      <div className="mb-4">
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        {user.email && (
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        )}
        {user.name && (
          <p>
            <strong>Name:</strong> {user.name}
          </p>
        )}
      </div>
      <Button onClick={handleLogout} variant="secondary">
        Sign Out
      </Button>
    </div>
  );
}
