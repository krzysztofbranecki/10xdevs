# API Endpoint Implementation Plan: POST /api/flashcards/generate

## 1. Przegląd punktu końcowego
Endpoint służy do generowania propozycji fiszek przy użyciu algorytmów sztucznej inteligencji. Klient przesyła długi tekst (od 1000 do 10000 znaków), a na podstawie tego tekstu generowane są propozycje fiszek (pytanie i odpowiedź). Endpoint wykorzystuje Supabase do autentykacji i interakcji z bazą danych, a także implementuje zasady polityk bezpieczeństwa i walidacji wg. Supabase RLS.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** /api/flashcards/generate
- **Parametry:**
  - **Wymagane:**
    - `input_text` (string, tekst o długości 1000-10000 znaków)
  - **Opcjonalne:**
    - `additional_options` (obiekt, np. { "model": "optional-model-name" })
- **Request Body:**
```json
{
  "input_text": "Text between 1000 and 10000 characters",
  "additional_options": { "model": "optional-model-name" }
}
```

## 3. Wykorzystywane typy
- `GenerateFlashcardsCommand` – model polecenia przyjmujący `input_text` oraz opcjonalne `additional_options`.
- `GenerateFlashcardsResultDto` – DTO zwracane jako rezultat, zawierające tablicę propozycji.
- `FlashcardProposalDto` – pojedyncza propozycja fiszki zawierająca pola `front` i `back`.
- `ErrorResponseDto` – model odpowiedzi błędnej z informacjami o błędzie.

## 4. Szczegóły odpowiedzi
- **Kod sukcesu:** 200 OK
- **Struktura odpowiedzi (JSON):**
```json
{
  "proposals": [
    { "front": "Proposed question", "back": "Proposed answer" },
    ...
  ]
}
```
- **Kody błędów:**
  - 400 Bad Request (błędne dane wejściowe, np. niewłaściwa długość `input_text`)
  - 401 Unauthorized (brak autoryzacji użytkownika)
  - 500 Internal Server Error (błąd generacji AI lub inny błąd serwera)

## 5. Przepływ danych
1. Klient wysyła żądanie do endpointu POST /api/flashcards/generate.
2. Middleware autoryzacyjne wykorzystuje `context.locals.supabase` do weryfikacji użytkownika i zapewnienia RLS.
3. Żądanie przechodzi walidację przy użyciu Zod, sprawdzając m.in. długość `input_text`.
4. Logika generowania fiszek jest przekazywana do dedykowanego serwisu (np. w `src/lib/services/flashcardsService.ts`), który komunikuje się z zewnętrznym serwisem AI (Openrouter.ai lub podobnym).
5. W przypadku wystąpienia błędu generacji, błąd jest logowany do tabeli `generation_errors_log`.
6. Na koniec, zwracana jest odpowiedź z wygenerowanymi propozycjami fiszek.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Użytkownik musi być autoryzowany przez Supabase (użycie `context.locals.supabase` i RLS).
- **Walidacja:** Dane wejściowe są walidowane przy użyciu Zod (sprawdzenie długości `input_text`).
- **Bezpieczeństwo danych:** Zastosowanie polityk RLS dla tabel `flashcards`, `source`, `generations` oraz `generation_errors_log`.
- **Logowanie błędów:** Błędy podczas generacji AI są rejestrowane w tabeli `generation_errors_log`.

## 7. Obsługa błędów
- **400 Bad Request:** Zwracane, gdy walidacja `input_text` nie powiedzie się.
- **401 Unauthorized:** Zwracane, gdy użytkownik nie jest autoryzowany.
- **500 Internal Server Error:** Zwracane w przypadku błędów zewnętrznego serwisu AI lub innych błędów serwera. Dodatkowo, błędy są logowane do tabeli `generation_errors_log`.

## 8. Rozważania dotyczące wydajności
- **Asynchroniczna komunikacja:** Wykorzystanie asynchronicznych wywołań do serwisu AI, aby nie blokować głównego wątku.
- **Optymalizacja walidacji:** Szybkie odrzucenie nieprawidłowych danych zapewnia zmniejszenie obciążenia serwera.
- **Monitorowanie:** Implementacja logowania i monitoringu czasu odpowiedzi, szczególnie przy komunikacji z serwisem AI.

## 9. Etapy wdrożenia
1. Utworzenie pliku endpointu: `src/pages/api/flashcards/generate.ts`.
2. Implementacja walidacji wejścia przy użyciu Zod (sprawdzanie długości `input_text`).
3. Integracja autoryzacji: pobranie użytkownika z `context.locals.supabase`.
4. Ekstrakcja logiki generowania fiszek do dedykowanego serwisu (np. `src/lib/services/flashcardsService.ts`).
5. Implementacja komunikacji z serwisem AI oraz obsługa odpowiedzi/propozycji.
6. Rejestracja błędów w tabeli `generation_errors_log` w przypadku niepowodzenia.
7. Zwracanie odpowiedzi API z poprawnymi kodami statusu i strukturą wynikową zgodnie z typem `GenerateFlashcardsResultDto`.
8. Przeprowadzenie testów integracyjnych i walidacji endpointu.
9. Aktualizacja dokumentacji API oraz wdrożenie endpointu na środowisko testowe/produkcyjne. 