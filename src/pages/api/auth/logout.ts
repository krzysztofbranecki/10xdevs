import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    // Utwórz instancję Supabase
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    // Wyloguj użytkownika
    await supabase.auth.signOut();

    console.log("User logged out successfully");

    // Przekieruj użytkownika na stronę logowania
    return redirect("/login");
  } catch (error) {
    console.error("Error during logout:", error);
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas wylogowywania" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
