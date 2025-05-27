# Specyfikacja modułu uwierzytelniania (Rejestracja, Logowanie, Odzyskiwanie hasła)

## 1. Architektura interfejsu użytkownika

### 1.1 Layouty i strony
- Nowy layout: `src/layouts/AuthLayout.astro`
  - Odpowiada za prosty wrapper dla stron auth (nagłówek, stopka, centralne wyrównanie zawartości).
- Strony w katalogu `src/pages`:
  - `register.astro`: formularz rejestracji
  - `login.astro`: formularz logowania
  - `password-recovery.astro`: formularz odzyskiwania hasła (wysyłka linku resetującego)

### 1.2 Komponenty React
W `src/components/Auth`:
- `RegisterForm.tsx`
- `LoginForm.tsx`
- `PasswordRecoveryForm.tsx`

Każdy komponent:
- Korzysta z React Hook Form + Zod do walidacji pól
- Wyświetla walidację w czasie rzeczywistym (email, hasło, potwierdzenie hasła)
- Obsługuje stany: ładowanie (spinner), sukces (komunikat), błąd (alert)
- Wywołuje API (`POST /api/auth/...`) i na podstawie odpowiedzi wykonuje redirect lub pokazuje błędy

### 1.3 Integracja Astro + React
- Strony `.astro` importują `AuthLayout` oraz ładują komponenty React:
  ```astro
  ---
  import AuthLayout from '../layouts/AuthLayout.astro';
  import RegisterForm from '../components/Auth/RegisterForm.tsx';
  ---
  <AuthLayout>
    <RegisterForm apiUrl="/api/auth/register" />
  </AuthLayout>
  ```
- Po pomyślnej rejestracji przekierowanie do `/login` z komunikatem o konieczności weryfikacji email
- Po pomyślnym logowaniu przekierowanie do strony głównej/`/generate`

### 1.4 Walidacja i komunikaty błędów
- **Walidacja klient-side**:
  - Email: poprawny format RFC
  - Hasło: min. 8 znaków, co najmniej 1 litera i 1 cyfra
  - Potwierdzenie hasła musi się zgadzać z polem hasło
- **Walidacja serwer-side**:
  - Podobne zasady jak po stronie klienta (ponowne sprawdzenie)
- **Komunikaty**:
  - Inline pod polami formularza
  - Globalny alert w przypadku błędu serwerowego (np. użytkownik istnieje, nieprawidłowe dane)

### 1.5 Scenariusze kluczowe
1. Użytkownik wypełnia formularz rejestracji poprawnie → API `/register` zwraca sukces → przekierowanie na `/login` z komunikatem
2. Błąd podczas rejestracji (użytkownik istnieje) → alert z odpowiednim komunikatem
3. Użytkownik loguje się poprawnie → API `/login` zwraca sesję → przekierowanie do `/generate`
4. Błąd logowania (nieprawidłowe dane) → inline alert

## 2. Logika backendowa

### 2.1 Struktura endpointów
Katalog `src/pages/api/auth`:
- `register.ts` – POST: rejestracja użytkownika
- `login.ts` – POST: logowanie
- `logout.ts` – POST: wylogowanie (czyszczenie sesji/cookie)

### 2.2 Modele i DTO
W `src/types.ts`:
```ts
export interface RegisterDTO { email: string; password: string; }
export interface LoginDTO    { email: string; password: string; }
export interface RecoverDTO  { email: string; }
export interface ApiResponse<T> { data?: T; error?: string; }
```

### 2.3 Walidacja danych
- Użycie Zod (lub manualnie) w każdym handlerze API
- Early return przy nieprawidłowym payloadzie (status 400)

### 2.4 Obsługa wyjątków
```ts
try {
  // wywołanie Supabase
} catch (err) {
  console.error(err);
  return new Response(JSON.stringify({ error: 'Wewnętrzny błąd serwera' }), { status: 500 });
}
```

### 2.5 SSR i ochrona stron
- Middleware w `src/middleware/index.ts`:
  - Sprawdza cookie sesji Supabase
  - Dla chronionych zasobów: brak sesji → redirect do `/login`
  - Dla stron auth: istniejąca sesja → redirect do `/generate`
- Alternatywnie w frontmatter stron Astro użycie `getSession` z `@supabase/auth-helpers-astro`

## 3. System autentykacji

### 3.1 Konfiguracja Supabase
- Zmienne w `.env`:
  ```
  SUPABASE_URL=...
  SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...
  ```
- Klienci w `src/lib`:
  - `supabaseClient.ts` – `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`
  - `supabaseAdmin.ts`  – `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)`

### 3.2 Integracja klient-side
- Formularze używają:
  - `supabaseClient.auth.signUp({ email, password })`
  - `supabaseClient.auth.signInWithPassword({ email, password })`
  - `supabaseClient.auth.resetPasswordForEmail(email)`
- Obsługa zwracanych błędów i tokenów

### 3.3 Sesje i ciasteczka
- Wykorzystanie `@supabase/auth-helpers-astro`:
  - Automatyczne ustawianie HttpOnly cookies
  - Odswieżanie tokenów i utrzymanie sesji między żądaniami

### 3.4 Wylogowanie
- Endpoint `POST /api/auth/logout`:
  - `await supabaseClient.auth.signOut()`
  - Usunięcie cookie, zwrócenie redirect do `/login`

### 3.5 Bezpieczeństwo i RODO
- Dane użytkownika i sesji przechowywane w Supabase (zgodnie z RODO)
- Możliwość pełnej dezaktywacji i usunięcia konta (endpoint `DELETE /api/auth/delete`)

## 4. Podsumowanie
- Pełna separacja warstwy front- i backend
- Reużywalne, testowalne komponenty React
- Bezproblemowa integracja z Astro SSR
- Wysoki poziom bezpieczeństwa i zgodność z RODO 