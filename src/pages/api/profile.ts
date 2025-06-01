import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../db/supabase.client";

export const GET: APIRoute = async ({ cookies, request }) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!data.user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || null,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
