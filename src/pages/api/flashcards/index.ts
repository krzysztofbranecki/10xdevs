import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  const { user, supabase } = locals;
  if (!user || !supabase) {
    return new Response(JSON.stringify({ error: "Brak autoryzacji" }), { status: 401 });
  }
  const body = await request.json();
  const schema = z.object({
    front: z.string().min(1).max(255),
    back: z.string().min(1).max(255),
  });
  const parse = schema.safeParse(body);
  if (!parse.success) {
    return new Response(JSON.stringify({ error: "Nieprawidłowe dane" }), { status: 400 });
  }
  const { front, back } = parse.data;
  const { data, error } = await supabase
    .from("flashcards")
    .insert({ front, back, user_id: user.id, collection_id: null })
    .select()
    .single();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(data), { status: 201 });
};
