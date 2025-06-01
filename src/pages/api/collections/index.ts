import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

export const prerender = false;

const createCollectionSchema = z.object({
  name: z.string().min(1, "Nazwa kolekcji jest wymagana").max(100),
  description: z.string().max(500).optional(),
});

export async function GET({
  locals,
}: {
  locals: { supabase: SupabaseClient; user?: { id: string } };
}): Promise<Response> {
  const userId = locals.user?.id;
  if (!userId) {
    return new Response(JSON.stringify({ collections: [] }), { status: 200 });
  }
  const { data, error } = await locals.supabase
    .from("collections")
    .select("id, name")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ collections: data }), { status: 200 });
}

export async function POST({
  request,
  locals,
}: {
  request: Request;
  locals: { supabase: SupabaseClient; user?: { id: string } };
}): Promise<Response> {
  const userId = locals.user?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "Brak autoryzacji" }), { status: 401 });
  }
  const body = await request.json();
  const result = createCollectionSchema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: "Nieprawidłowe dane", details: result.error.errors }), { status: 400 });
  }
  const { name, description } = result.data;
  const { data, error } = await locals.supabase
    .from("collections")
    .insert({ name, description: description || null, user_id: userId })
    .select()
    .single();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ id: data.id, name: data.name }), { status: 201 });
}
