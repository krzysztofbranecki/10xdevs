import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../db/supabase.client";

export const POST: APIRoute = async ({ cookies, request }) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Wyloguj użytkownika (czyści sesję po stronie Supabase)
  await supabase.auth.signOut();

  // Opcjonalnie: wyczyść cookie sesji ręcznie, jeśli to konieczne
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
