import type { APIRoute } from "astro";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

export const prerender = false;

export const PATCH: APIRoute = async ({ params, locals, request }) => {
  const { id } = params;
  const { user, supabase } = locals as { user?: { id: string }; supabase: SupabaseClient };
  if (!user || !supabase) {
    return new Response(JSON.stringify({ error: "Brak autoryzacji" }), { status: 401 });
  }
  const body = await request.json();
  const schema = z.object({
    collection_id: z.string().nullable(),
  });
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return new Response(JSON.stringify({ error: "Nieprawidłowe dane" }), { status: 400 });
  }
  // Check if flashcard belongs to user
  const { data: flashcard, error: fetchError } = await supabase
    .from("flashcards")
    .select("id, user_id")
    .eq("id", id)
    .single();
  if (fetchError || !flashcard) {
    return new Response(JSON.stringify({ error: "Nie znaleziono fiszki" }), { status: 404 });
  }
  if (flashcard.user_id !== user.id) {
    return new Response(JSON.stringify({ error: "Brak dostępu" }), { status: 401 });
  }
  // Update collection_id
  const { collection_id } = parse.data;
  const { error: updateError } = await supabase.from("flashcards").update({ collection_id }).eq("id", id);
  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
