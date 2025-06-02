import type { APIRoute } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { id } = params;
  const { user, supabase } = locals as { user?: { id: string }; supabase: SupabaseClient };
  if (!user || !supabase) {
    return new Response(JSON.stringify({ error: "Brak autoryzacji" }), { status: 401 });
  }
  // Fetch collection and its flashcards
  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("id, name, description, created_at, updated_at, user_id")
    .eq("id", id)
    .single();
  if (collectionError || !collection) {
    return new Response(JSON.stringify({ error: "Nie znaleziono kolekcji" }), { status: 404 });
  }
  if (collection.user_id !== user.id) {
    return new Response(JSON.stringify({ error: "Brak dostępu" }), { status: 401 });
  }
  const { data: flashcards, error: flashcardsError } = await supabase
    .from("flashcards")
    .select("id, front, back")
    .eq("collection_id", id);
  if (flashcardsError) {
    return new Response(JSON.stringify({ error: flashcardsError.message }), { status: 500 });
  }
  return new Response(
    JSON.stringify({
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        created_at: collection.created_at,
        updated_at: collection.updated_at,
      },
      flashcards: flashcards || [],
    }),
    { status: 200 }
  );
};

export const PATCH: APIRoute = async ({ params, locals, request }) => {
  const { id } = params;
  const { user, supabase } = locals as { user?: { id: string }; supabase: SupabaseClient };
  if (!user || !supabase) {
    return new Response(JSON.stringify({ error: "Brak autoryzacji" }), { status: 401 });
  }
  // Validate input
  const body = await request.json();
  const schema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
  });
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return new Response(JSON.stringify({ error: "Nieprawidłowe dane" }), { status: 400 });
  }
  // Check if collection exists and belongs to user
  const { data: collection, error: fetchError } = await supabase
    .from("collections")
    .select("id, user_id")
    .eq("id", id)
    .single();
  if (fetchError || !collection) {
    return new Response(JSON.stringify({ error: "Nie znaleziono kolekcji" }), { status: 404 });
  }
  if (collection.user_id !== user.id) {
    return new Response(JSON.stringify({ error: "Brak dostępu" }), { status: 401 });
  }
  // Update collection
  const { name, description } = parse.data;
  const { error: updateError } = await supabase.from("collections").update({ name, description }).eq("id", id);
  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { id } = params;
  const { user, supabase } = locals as { user?: { id: string }; supabase: SupabaseClient };
  if (!user || !supabase) {
    return new Response(JSON.stringify({ error: "Brak autoryzacji" }), { status: 401 });
  }
  // Check if collection exists and belongs to user
  const { data: collection, error: fetchError } = await supabase
    .from("collections")
    .select("id, user_id")
    .eq("id", id)
    .single();
  if (fetchError || !collection) {
    return new Response(JSON.stringify({ error: "Nie znaleziono kolekcji" }), { status: 404 });
  }
  if (collection.user_id !== user.id) {
    return new Response(JSON.stringify({ error: "Brak dostępu" }), { status: 401 });
  }
  // Delete collection
  const { error: deleteError } = await supabase.from("collections").delete().eq("id", id);
  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
