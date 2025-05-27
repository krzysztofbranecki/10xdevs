import { defineMiddleware } from "astro/middleware";
import { createSupabaseServerInstance } from "../db/supabase.client.ts";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/password-recovery",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/recover",
];

export const onRequest = defineMiddleware(async ({ request, cookies, locals, url, redirect }, next) => {
  try {
    // Zawsze tworzymy instancję Supabase niezależnie od ścieżki
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    locals.supabase = supabase;

    // Dla publicznych ścieżek nie sprawdzamy sesji
    if (PUBLIC_PATHS.includes(url.pathname)) {
      return next();
    }

    // Sprawdzamy sesję użytkownika
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return redirect("/login");
    }

    // Zapisujemy dane użytkownika w locals
    locals.user = {
      id: data.user.id,
      email: data.user.email,
    };

    return next();
  } catch (error) {
    console.error("Middleware error:", error);
    // Dla bezpieczeństwa, w razie błędu, przekierowujemy do logowania
    return redirect("/login");
  }
});
