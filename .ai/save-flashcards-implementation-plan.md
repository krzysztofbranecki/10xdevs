# API Endpoint Implementation Plan: POST /api/flashcards/save

## 1. Przegląd punktu końcowego

Endpoint ten umożliwia tworzenie nowych fiszek (flashcards) poprzez ręczne podanie treści lub akceptację fiszki wygenerowanej przez AI. Po otrzymaniu i walidacji danych, endpoint zapisze nową fiszkę w bazie danych, powiązaną z autoryzowanym użytkownikiem.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/flashcards/save`
- **Parametry**:
  - **Wymagane**:
    - `front` – tekst przodu fiszki
    - `back` – tekst tyłu fiszki
  - **Opcjonalne**:
    - `source_id` – UUID, identyfikator źródła
    - `generation_id` – UUID, identyfikator generacji
- **Request Body**:

```json
{
  "front": "Flashcard front text",
  "back": "Flashcard back text",
  "source_id": "uuid (optional)",
  "generation_id": "uuid (optional)"
}
```

## 3. Wykorzystywane typy

- **DTO**:
  - `FlashcardDto` – reprezentuje utworzoną fiszkę zwróconą w odpowiedzi
- **Command Model**:
  - `CreateFlashcardCommand` – zawiera pola: `front`, `back`, `source_id`, `generation_id`
- **Walidacja**: Użyj biblioteki `zod` do walidacji zgodności danych wejściowych z modelem `CreateFlashcardCommand`.

## 4. Szczegóły odpowiedzi

- **Kod statusu**: 201 Created przy pomyślnym utworzeniu
- **Struktura odpowiedzi**:

```json
{
  "id": "uuid",
  "front": "Flashcard front text",
  "back": "Flashcard back text",
  "user_id": "uuid",
  "source_id": "uuid or null",
  "generation_id": "uuid or null",
  "created_at": "timestamp"
}
```

- **Dodatkowe kody statusu w przypadku błędów**:
  - 400 Bad Request – nieprawidłowe dane wejściowe
  - 401 Unauthorized – brak autoryzacji
  - 500 Internal Server Error – błąd serwera

## 5. Przepływ danych

1. Klient wysyła żądanie POST do `/api/flashcards/save` z danymi fiszki.
2. Endpoint odbiera żądanie i wykorzystuje schemat walidacji (np. z użyciem `zod`) aby sprawdzić dane wejściowe według modelu `CreateFlashcardCommand`.
3. Po pozytywnej walidacji, logika odpowiedzialna za tworzenie fiszki (wyodrębniona do serwisu, np. `flashcardService` w `/src/lib/services`) wykonuje operację zapisu nowego rekordu do bazy danych, korzystając z klienta Supabase dostępnego w `context.locals`.
4. Nowo utworzony rekord jest pobierany z bazy danych, uzupełniany o dodatkowe pola (np. `user_id`, `created_at`) i przekształcany do formatu zgodnego z `FlashcardDto`.
5. Endpoint zwraca odpowiedź z kodem 201 i utworzoną fiszką w formacie JSON.

## 6. Względy bezpieczeństwa

- **Autoryzacja**: Endpoint powinien sprawdzać, czy użytkownik jest uwierzytelniony i ma odpowiednie uprawnienia (oparte m.in. na Supabase RLS, gdzie dostęp do danych ograniczony jest do użytkownika).
- **Walidacja danych**: Użycie `zod` zabezpiecza przed wprowadzeniem niepoprawnych danych i potencjalnymi atakami (np. injection).
- **Bezpieczeństwo bazy danych**: Korzystanie z przygotowanych zapytań oraz implementacja RLS w tabeli `flashcards`, aby ograniczyć dostęp tylko do właściwych danych.
- **Sanityzacja danych**: Przed zapisaniem, dane wejściowe powinny być odpowiednio oczyszczone.

## 7. Obsługa błędów

- **400 Bad Request**: Zwracane w przypadku niepoprawnych lub brakujących danych wejściowych.
- **401 Unauthorized**: Zwracane, gdy użytkownik nie jest uwierzytelniony lub nie ma dostępu do tworzenia zasobu.
- **500 Internal Server Error**: Używane w przypadku nieoczekiwanych błędów serwera lub problemów z bazą danych.
- **Rejestrowanie błędów**: Wdrożenie systemu logowania błędów (np. w middleware) w celu monitorowania problemów, przy jednoczesnym ukrywaniu szczegółowych informacji przed użytkownikiem.

## 8. Rozważania dotyczące wydajności

- **Optymalizacja zapytań**: Upewnienie się, że operacje bazy danych są wykonywane efektywnie przy użyciu indeksów na kolumnach `user_id`, `source_id` oraz `generation_id`.
- **Middleware**: Możliwość implementacji middleware do buforowania lub ograniczania logowania, co przyczyni się do poprawy wydajności.

## 9. Etapy wdrożenia

1. Utworzenie nowego endpointu API w katalogu `/src/pages/api/flashcards/save.ts`.
2. Zdefiniowanie schematu walidacji danych wejściowych za pomocą `zod` na podstawie `CreateFlashcardCommand`.
3. Wyodrębnienie logiki tworzenia fiszki do serwisu (np. w pliku `/src/lib/services/flashcardService.ts`).
4. Implementacja operacji zapisu do bazy danych z wykorzystaniem klienta Supabase dostępnego przez `context.locals`.
5. Zaimplementowanie odpowiedniej obsługi błędów i logiki rejestrowania wyjątków.
6. Testowanie endpointu (unit testy, testy integracyjne) pod kątem poprawności, bezpieczeństwa oraz wydajności.
7. Przegląd kodu i wdrożenie poprawek zgodnie z wynikami testów oraz feedbackiem od zespołu.
