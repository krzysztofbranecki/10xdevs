import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    let email, password, redirectUrl;
    const contentType = request.headers.get("content-type") || "";

    // Obsługujemy zarówno JSON jak i form data
    if (contentType.includes("application/json")) {
      // Parsujemy JSON
      const body = await request.json().catch(() => null);

      if (!body || typeof body !== "object") {
        console.error("Invalid request body format");
        return new Response(JSON.stringify({ error: "Niepoprawny format danych" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      email = body.email;
      password = body.password;
      redirectUrl = body.redirectUrl;
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      // Parsujemy form data
      const formData = await request.formData();
      email = formData.get("email");
      password = formData.get("password");
      redirectUrl = formData.get("redirectUrl");
    } else {
      return new Response(JSON.stringify({ error: "Nieobsługiwany typ zawartości" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!email || !password) {
      console.error("Missing email or password");
      return new Response(JSON.stringify({ error: "Email i hasło są wymagane" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    console.log("Attempting login for:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email),
      password: String(password),
    });

    if (error) {
      console.error("Supabase auth error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Login successful for:", email);

    // Opcjonalne przekierowanie po udanym logowaniu
    if (redirectUrl && typeof redirectUrl === "string") {
      return Response.redirect(redirectUrl, 302);
    }

    return new Response(JSON.stringify({ user: data.user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error during login:", error);
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas logowania" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
