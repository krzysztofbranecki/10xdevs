import React, { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "./Button";

interface User {
  id: string;
  email?: string;
  name?: string;
}

interface UserProfileProps {
  supabaseClient: SupabaseClient;
}

export const UserProfile: React.FC<UserProfileProps> = ({ supabaseClient }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabaseClient.auth.getUser();

        if (error) {
          setError(error.message);
          return;
        }

        if (data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabaseClient]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        setError(error.message);
        return;
      }
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
    } finally {
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
      <Button onClick={handleSignOut} variant="secondary">
        Sign Out
      </Button>
    </div>
  );
};
