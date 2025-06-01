import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    let email, password, confirmPassword;
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
      confirmPassword = body.confirmPassword;
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      // Parsujemy form data
      const formData = await request.formData();
      email = formData.get("email");
      password = formData.get("password");
      confirmPassword = formData.get("confirmPassword");
    } else {
      return new Response(JSON.stringify({ error: "Nieobsługiwany typ zawartości" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sprawdzamy czy wszystkie wymagane pola są wypełnione
    if (!email || !password || !confirmPassword) {
      console.error("Missing required fields");
      return new Response(JSON.stringify({ error: "Wszystkie pola są wymagane" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sprawdzamy czy hasła się zgadzają
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return new Response(JSON.stringify({ error: "Hasła nie są identyczne" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sprawdzamy minimalną długość hasła
    if (String(password).length < 8) {
      console.error("Password too short");
      return new Response(JSON.stringify({ error: "Hasło musi zawierać co najmniej 8 znaków" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    console.log("Attempting registration for:", email);

    const { data, error } = await supabase.auth.signUp({
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

    console.log("Registration successful for:", email);

    return new Response(JSON.stringify({ 
      user: data.user,
      message: "Rejestracja zakończona pomyślnie! Sprawdź swoją skrzynkę email aby potwierdzić konto."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error during registration:", error);
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas rejestracji" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}; 