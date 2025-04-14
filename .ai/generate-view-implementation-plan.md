# Plan implementacji widoku "Generowanie fiszek"

## 1. Przegląd
Widok umożliwia użytkownikowi wprowadzenie tekstu (o długości od 1000 do 10000 znaków), na podstawie którego generowane są propozycje fiszek przy użyciu AI. Użytkownik ma możliwość przeglądania, edycji oraz zatwierdzania wygenerowanych fiszek, co usprawnia proces tworzenia materiału do nauki.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/generate`.

## 3. Struktura komponentów
- **GenerateFlashcardsView** – główny komponent widoku, zarządzający stanem i integracją z API.
  - **InputTextArea** – pole tekstowe do wprowadzania treści wejściowej, z walidacją długości.
  - **GenerateButton** – przycisk inicjujący wywołanie API generującego fiszki.
  - **LoadingIndicator** – wizualny wskaźnik ładowania obecny podczas procesowania żądania.
  - **FlashcardProposalList** – kontener wyświetlający listę wygenerowanych propozycji fiszek.
    - **FlashcardProposalCard** – pojedyncza karta wyświetlająca propozycję fiszki z opcjami edycji, akceptacji lub odrzucenia.
  - **Toast/Notification** – komponent wyświetlający powiadomienia o błędach lub sukcesie akcji.

## 4. Szczegóły komponentów

### GenerateFlashcardsView
- **Opis:** Główny komponent, który integruje pozostałe elementy widoku, zarządza stanem (inputText, proposals, loading, error) oraz koordynuje wywołania API.
- **Główne elementy:**
  - Wrapper widoku (np. `<section>`).
  - Komponent `InputTextArea`.
  - Komponent `GenerateButton`.
  - Komponent `LoadingIndicator` (widoczny podczas ładowania).
  - Komponent `FlashcardProposalList`.
  - Komponent powiadomień (Toast).
- **Obsługiwane interakcje:**
  - Wprowadzanie tekstu przez użytkownika.
  - Kliknięcie przycisku wywołującego funkcję generowania.
  - Odbiór i wyświetlenie propozycji fiszek.
  - Przejście do trybu edycji dla proponowanych fiszek.
- **Walidacja:**
  - Sprawdzenie długości tekstu przed wysłaniem żądania (min. 1000, max. 10000 znaków).
- **Typy:**
  - Wewnętrzny model widoku, np. `GenerateViewModel` z polami: `inputText: string`, `proposals: FlashcardProposalDto[]`, `loading: boolean`, `error: string | null`.
- **Propsy:**
  - Jako główny widok nie przyjmuje zewnętrznych propsów.

### InputTextArea
- **Opis:** Komponent pola tekstowego umożliwiający wprowadzenie treści wejściowej, z informacją o wymaganej długości.
- **Główne elementy:**
  - Element `<textarea>` stylizowany za pomocą Tailwind CSS.
  - Etykieta informująca o ograniczeniach (min. 1000, max. 10000 znaków).
- **Obsługiwane interakcje:**
  - Wprowadzanie i modyfikacja tekstu.
  - Wywołanie walidacji na zmianę wartości.
- **Walidacja:**
  - Sprawdzenie długości tekstu.
- **Typy i Propsy:**
  - Propsy: `{ value: string; onChange: (value: string) => void; error?: string }`.

### GenerateButton
- **Opis:** Przycisk, który inicjuje wywołanie API generującego fiszki.
- **Główne elementy:**
  - Element `<button>` z etykietą "Generuj".
- **Obsługiwane interakcje:**
  - Kliknięcie przycisku wywołujące funkcję `handleGenerate` w komponencie rodzicu.
- **Walidacja:**
  - Przycisk aktywny tylko, gdy pole tekstowe spełnia kryteria długości.
- **Typy i Propsy:**
  - Propsy: `{ disabled: boolean; onClick: () => void; }`.

### LoadingIndicator
- **Opis:** Wizualny element informujący o trwającym procesie generowania fiszek.
- **Główne elementy:**
  - Spinner lub pasek postępu.
- **Obsługiwane interakcje:**
  - Brak interakcji – wyłącznie informacja wizualna.

### FlashcardProposalList
- **Opis:** Kontener wyświetlający listę wygenerowanych propozycji fiszek.
- **Główne elementy:**
  - Lista komponentów `FlashcardProposalCard`.
- **Typy i Propsy:**
  - Propsy: `{ proposals: FlashcardProposalDto[]; onEdit: (index: number, newProposal: FlashcardProposalDto) => void; onAccept: (index: number) => void; onDecline: (index: number) => void; }`.

### FlashcardProposalCard
- **Opis:** Pojedynczy komponent wyświetlający pojedynczą propozycję fiszki z możliwością edycji treści, akceptacji lub odrzucenia.
- **Główne elementy:**
  - Wyświetlanie pól `front` i `back` fiszki.
  - Ikony/przyciski umożliwiające edycję, zatwierdzenie lub odrzucenie propozycji.
  - Tryb edycji umożliwiający zmianę treści fiszki.
- **Obsługiwane interakcje:**
  - Przejście do trybu edycji po kliknięciu ikony.
  - Wywołanie funkcji `onEdit`, `onAccept` lub `onDecline` w zależności od działań użytkownika.
- **Walidacja:**
  - Sprawdzenie, czy edytowany tekst nie jest pusty.
- **Typy i Propsy:**
  - Propsy: `{ proposal: FlashcardProposalDto; index: number; onEdit: (index: number, newProposal: FlashcardProposalDto) => void; onAccept: (index: number) => void; onDecline: (index: number) => void; }`.

## 5. Typy
- **GenerateViewModel:**
  - `inputText: string`
  - `proposals: FlashcardProposalDto[]` (wykorzystujemy definicję z `types.ts`)
  - `loading: boolean`
  - `error: string | null`
- **FlashcardProposalDto:**
  - `{ front: string; back: string; }` (zgodnie z definicją w `types.ts`)
- Dodatkowe typy dla komponentów (InputTextArea, GenerateButton, FlashcardProposalCard) zgodnie z powyższymi opisami.

## 6. Zarządzanie stanem
- Użycie hooków React (`useState`) do przechowywania:
  - `inputText` – tekst wpisany przez użytkownika
  - `proposals` – lista wygenerowanych fiszek
  - `loading` – informacja o trwającym procesie generowania
  - `error` – komunikat błędu
- Opcjonalne utworzenie custom hooka `useGenerateFlashcards` do obsługi logiki wywołania API, walidacji oraz aktualizacji stanu.

## 7. Integracja API
- Wykorzystanie metody `fetch` do wywołania endpointu `POST /api/flashcards/generate`.
- Wysyłane dane w formacie JSON:
  - `input_text`: tekst pobrany z komponentu `InputTextArea`
  - `additional_options`: opcjonalne, np. `{ model: string }`
- Oczekiwana odpowiedź:
  - Sukces (200): JSON z tablicą `proposals` zawierającą obiekty `FlashcardProposalDto`.
  - Błędy: 400 (błąd walidacji) lub 500 (błąd serwera) – odpowiednio obsługiwane poprzez wyświetlanie powiadomień.

## 8. Interakcje użytkownika
- Użytkownik wprowadza tekst do pola `InputTextArea`.
- Po kliknięciu `GenerateButton`:
  - Przeprowadza się wstępna walidacja długości tekstu.
  - Rozpoczyna się wywołanie API (ustawienie stanu `loading` na true, wyświetlenie `LoadingIndicator`).
- Po otrzymaniu odpowiedzi wyświetlana jest lista fiszek w `FlashcardProposalList`.
- Użytkownik może edytować propozycje poprzez interakcję z `FlashcardProposalCard` oraz zatwierdzić lub odrzucić poszczególne fiszki.
- W przypadku błędów (np. walidacji lub odpowiedzi API) wyświetlany jest komunikat za pomocą Toast/Notification.

## 9. Warunki i walidacja
- **Tekst wejściowy:**
  - Musi zawierać od 1000 do 10000 znaków; walidacja odbywa się na bieżąco oraz przed wywołaniem API.
- **Przycisk "Generuj":**
  - Aktywny tylko, gdy tekst spełnia wymagane kryteria.
- **Edycja fiszek:**
  - Pola nie mogą być puste, aktualizacja odbywa się dopiero po zatwierdzeniu zmian.
- **Odpowiedź API:**
  - Sprawdzany status odpowiedzi; w przypadku błędu, odpowiedni komunikat jest wyświetlany użytkownikowi.

## 10. Obsługa błędów
- Walidacja tekstu: Informowanie użytkownika o niezgodności długości w polu wejściowym.
- Błędy API: Wyświetlenie toastu z komunikatem o błędzie przy odpowiedziach 400 lub 500.
- Błędy sieciowe: Możliwość ponowienia akcji generowania oraz informacja o problemach z połączeniem.

## 11. Kroki implementacji
1. Utworzenie nowej strony widoku w katalogu `/src/pages`, np. `generate.astro`, która będzie integrować komponent React.
2. Implementacja głównego komponentu `GenerateFlashcardsView` z zarządzaniem stanem i integracją API.
3. Utworzenie komponentu `InputTextArea` z walidacją długości tekstu.
4. Utworzenie komponentu `GenerateButton` odpowiedzialnego za inicjowanie wywołania API.
5. Implementacja komponentu `LoadingIndicator` do wizualizacji procesu ładowania.
6. Utworzenie komponentu `FlashcardProposalList` oraz `FlashcardProposalCard` do wyświetlania i edycji propozycji fiszek.
7. Opcjonalnie, stworzenie custom hooka `useGenerateFlashcards` do enkapsulacji logiki wywołania API, walidacji oraz aktualizacji stanu.
8. Integracja z endpointem `POST /api/flashcards/generate` – wysyłanie żądania, parsowanie odpowiedzi i obsługa błędów.
9. Testowanie wszystkich interakcji, walidacji oraz scenariuszy błędów.
10. Stylizacja wszystkich komponentów przy użyciu Tailwind CSS i Shadcn/ui, dbając o responsywność oraz dostępność interfejsu. 