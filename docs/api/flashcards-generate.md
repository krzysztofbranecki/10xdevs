# Dokumentacja Endpointa: POST /api/flashcards/generate

## Opis Endpointa
Endpoint służy do generowania propozycji fiszek przy użyciu algorytmów AI. Aktualnie, dane zwracane są na podstawie symulacji (mockowanych danych).

## Metoda HTTP
**POST**

## URL
`/api/flashcards/generate`

## Autoryzacja
W tej wersji endpoint jest publiczny, autoryzacja została wyłączona.

## Request Body
Oczekiwany format żądania to JSON:

```json
{
  "input_text": "Tekst o długości między 1000 a 10000 znaków...",
  "additional_options": {
    "model": "opcjonalna_nazwa_modelu"
  }
}
```

- `input_text` (string): Wymagane. Tekst o długości min. 1000 i maks. 10000 znaków.
- `additional_options` (obiekt, opcjonalnie): Może zawierać dodatkowe opcje, np. `model` (string, opcjonalnie).

## Odpowiedź (Sukces)

- **Status:** 200 OK
- **Body:**

```json
{
  "proposals": [
    {
      "front": "Przykładowe pytanie",
      "back": "Przykładowa odpowiedź"
    }
  ]
}
```

## Obsługa Błędów

W przypadku błędów endpoint zwraca odpowiednie kody statusu wraz z komunikatem błędu.

- **400 Bad Request:** Błąd walidacji danych wejściowych.
  - Przykładowa odpowiedź:

    ```json
    {
      "error": "Szczegóły błędu walidacji...",
      "error_code": 400
    }
    ```

- **401 Unauthorized:** Brak autoryzacji. Użytkownik nie jest uwierzytelniony.
  - Przykładowa odpowiedź:

    ```json
    {
      "error": "Unauthorized",
      "error_code": 401
    }
    ```

- **500 Internal Server Error:** Błąd wewnętrzny, np. podczas wywołania serwisu AI lub w przypadku innych problemów.
  - Przykładowa odpowiedź:

    ```json
    {
      "error": "Internal Server Error",
      "error_code": 500
    }
    ```

## Dodatkowe Informacje

- Aktualnie endpoint wykorzystuje dane mokowane poprzez funkcję `generateFlashcards` w `src/lib/services/flashcardsService.ts`.
- W przypadku wystąpienia błędu podczas generowania fiszek, szczegóły błędu są logowane do tabeli `generation_errors_log` w bazie danych Supabase.

## Przykładowe Zapytanie CURL

```bash
curl -X POST https://your-domain.com/api/flashcards/generate \
-H 'Content-Type: application/json' \
-d '{ "input_text": "Tekst o długości ...", "additional_options": { "model": "nazwa_modelu" } }'
``` 