```markdown
# Plan Testów dla Aplikacji 10x-cards

## 1. Wprowadzenie

### 1.1 Cel planu testów

Celem niniejszego planu testów jest zdefiniowanie strategii, zasobów, harmonogramu oraz zakresu działań testowych dla aplikacji 10x-cards. Plan ma na celu zapewnienie wysokiej jakości produktu poprzez systematyczne wykrywanie błędów i weryfikację zgodności z wymaganiami funkcjonalnymi i niefunkcjonalnymi, bazując na dostarczonej bazie kodu i dokumentacji projektowej.

### 1.2 Zakres testowania

Testowanie obejmie kluczowe funkcjonalności aplikacji 10x-cards w wersji MVP, w tym:

- Rejestracja i logowanie użytkowników (z wykorzystaniem Supabase Auth).
- Generowanie propozycji fiszek za pomocą AI (integracja z OpenRouter API).
- Interfejs użytkownika do wprowadzania tekstu i wyświetlania propozycji fiszek.
- Edycja, akceptacja i odrzucanie wygenerowanych propozycji fiszek (frontend).
- Zapisywanie zaakceptowanych fiszek (częściowo - logika frontendowa, brak endpointu backendowego).
- Integracja z bazą danych Supabase (konfiguracja, migracje, logowanie błędów).
- Podstawowe działanie API (`/api/flashcards/generate`).
- Walidacja danych wejściowych (frontend i backend).
- Podstawowa responsywność i spójność wizualna interfejsu (Tailwind, Shadcn/ui).
- Statyczna analiza kodu i procesy CI/CD (jako wsparcie jakości).

**Poza zakresem testów MVP (na podstawie analizy kodu i dokumentacji):**

- Pełne testy End-to-End przepływu akceptacji fiszki (z powodu braku endpointu `/api/flashcards` POST).
- Pełna funkcjonalność CRUD dla ręcznie tworzonych fiszek (brak implementacji API).
- Funkcjonalność sesji nauki (Spaced Repetition).
- Zaawansowane testy bezpieczeństwa związane z RLS (RLS jest obecnie wyłączone w najnowszej migracji).
- Zaawansowane testy wydajnościowe.
- Testy importu/eksportu danych.
- Funkcje administracyjne.
- Współdzielenie fiszek.

## 2. Strategia testowania

### 2.1 Typy testów do przeprowadzenia

- **Testy jednostkowe (Unit Tests):** Skupione na izolowanych funkcjach i komponentach (głównie w `src/lib/services`, `src/lib/validators`, `src/utils`, oraz komponentach React). Narzędzia: Vitest, React Testing Library.
- **Testy integracyjne (Integration Tests):** Weryfikacja interakcji pomiędzy komponentami, serwisami oraz modułami (np. `GenerateFlashcardsView` z `flashcardsService`, `flashcardsService` z `openrouter.service` (mockowanym), API endpoint z serwisami). Narzędzia: Vitest, React Testing Library, Supertest (dla API).
- **Testy API (API Tests):** Bezpośrednie testowanie endpointu `/api/flashcards/generate` pod kątem logiki biznesowej, walidacji, obsługi błędów i formatu odpowiedzi. Narzędzia: Postman, pliki `.http`, Supertest/fetch w skryptach testowych.
- **Testy End-to-End (E2E Tests):** Symulacja przepływów użytkownika w przeglądarce, obejmująca kluczowe scenariusze (Rejestracja, Logowanie, Generowanie fiszek - bez akceptacji). Narzędzia: Playwright lub Cypress.
- **Testy interfejsu użytkownika (UI Tests):**
  - **Testy wizualnej regresji:** Porównywanie zrzutów ekranu UI w celu wykrycia niezamierzonych zmian wizualnych. Narzędzia: Playwright/Cypress z integracją np. Percy.io.
  - **Testy komponentów UI:** Weryfikacja renderowania i podstawowej interakcji komponentów Shadcn/ui w kontekście aplikacji.
  - **Testy responsywności:** Manualne i automatyczne sprawdzanie wyglądu na różnych rozmiarach ekranu.
- **Testy dostępności (Accessibility Tests):** Weryfikacja zgodności z podstawowymi standardami WCAG przy użyciu narzędzi automatycznych (np. Axe) i manualnej inspekcji.
- **Testy bezpieczeństwa (Security Tests - ograniczone):** Podstawowa weryfikacja przepływów autoryzacji. Pełne testy RLS będą wymagane po jego ponownym włączeniu.
- **Testy eksploracyjne:** Manualne testowanie aplikacji w celu odkrycia nieprzewidzianych błędów i problemów z użytecznością.

### 2.2 Priorytety testowania

Testowanie będzie prowadzone zgodnie z następującymi priorytetami (od najwyższego do najniższego):

1.  **Rdzeń generowania fiszek AI:** Endpoint `/api/flashcards/generate`, serwisy `flashcardsService` i `openrouter.service`, interfejs `/generate` (wprowadzanie tekstu, wyświetlanie propozycji, edycja/odrzucenie).
2.  **Autentykacja:** Rejestracja i logowanie użytkowników.
3.  **Integracja z Supabase:** Poprawność konfiguracji, działanie middleware, logowanie błędów do `generation_errors_log`.
4.  **Walidacja danych:** Testy jednostkowe dla walidatorów Zod i funkcji walidujących.
5.  **Podstawowe komponenty UI:** Poprawność działania kluczowych komponentów interaktywnych (`GenerateFlashcardsView`, `FlashcardProposalCard`).
6.  **Spójność wizualna i responsywność:** Podstawowe testy UI.
7.  **Dostępność:** Podstawowe testy dostępności.
8.  **Pozostałe funkcjonalności** (np. strona powitalna).

## 3. Środowisko testowe

### 3.1 Wymagania sprzętowe i programowe

- System operacyjny: Windows, macOS, Linux.
- Node.js: Wersja zgodna z `.nvmrc` (22.14.0).
- Przeglądarki: Chrome (najnowsza), Firefox (najnowsza), Safari (najnowsza - opcjonalnie).
- Narzędzia deweloperskie przeglądarki.
- Dostęp do Internetu (dla pobierania zależności i potencjalnych testów E2E z realnym API).
- Supabase CLI (do zarządzania lokalnym środowiskiem Supabase).
- Docker (zalecany do uruchomienia lokalnego Supabase).

### 3.2 Konfiguracja środowiska

- Sklonowanie repozytorium projektu.
- Instalacja zależności za pomocą `npm install` (lub `yarn install`, chociaż `package-lock.json` nie ma, a jest `yarn.lock`, ale skrypty używają `npm`. Należy to ujednolicić - zakładam użycie `npm` zgodnie ze skryptami).
- Ustawienie zmiennych środowiskowych w pliku `.env` na podstawie `.env.example` (dla Supabase i OpenRouter - można użyć kluczy testowych/deweloperskich).
- Uruchomienie lokalnej instancji Supabase (`supabase start`).
- Aplikacja uruchomiona lokalnie za pomocą `npm run dev`.
- Dedykowana baza danych Supabase do celów testowych (lokalna lub zdalna instancja testowa).

## 4. Przypadki testowe

| ID Testu        | Opis                                                                | Kroki Testowe                                                                                                                                                                                                    | Oczekiwany Rezultat                                                                                                                                                                                                                                             | Priorytet |
| :-------------- | :------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------- |
| **AUTH-001**    | Pomyślna rejestracja nowego użytkownika                             | 1. Przejdź do `/register`. 2. Wprowadź prawidłowy, unikalny email i hasło (zgodne z wymaganiami). 3. Potwierdź hasło. 4. Zaznacz zgodę na warunki. 5. Kliknij "Zarejestruj się".                                 | Użytkownik zostaje pomyślnie zarejestrowany, zalogowany i przekierowany (np. do strony głównej lub `/generate`). Odpowiednie dane pojawiają się w tabeli `auth.users` w Supabase.                                                                               | Wysoki    |
| **AUTH-002**    | Nieudana rejestracja (email już istnieje)                           | 1. Przejdź do `/register`. 2. Wprowadź email, który już istnieje w systemie. 3. Wprowadź hasło i potwierdzenie. 4. Zaznacz zgodę. 5. Kliknij "Zarejestruj się".                                                  | Wyświetlany jest komunikat błędu informujący, że użytkownik o podanym adresie email już istnieje. Użytkownik nie zostaje zarejestrowany ani zalogowany.                                                                                                         | Wysoki    |
| **AUTH-003**    | Pomyślne logowanie istniejącego użytkownika                         | 1. Przejdź do `/login`. 2. Wprowadź prawidłowy email i hasło istniejącego użytkownika. 3. Kliknij "Zaloguj się".                                                                                                 | Użytkownik zostaje pomyślnie zalogowany i przekierowany. Aplikacja uzyskuje token dostępowy.                                                                                                                                                                    | Wysoki    |
| **AUTH-004**    | Nieudane logowanie (błędne hasło)                                   | 1. Przejdź do `/login`. 2. Wprowadź prawidłowy email istniejącego użytkownika i nieprawidłowe hasło. 3. Kliknij "Zaloguj się".                                                                                   | Wyświetlany jest komunikat błędu informujący o nieprawidłowych danych logowania. Użytkownik nie zostaje zalogowany.                                                                                                                                             | Wysoki    |
| **GEN-UI-001**  | Wprowadzenie tekstu do generowania - walidacja długości (za krótki) | 1. Przejdź do `/generate`. 2. Wprowadź tekst krótszy niż 1000 znaków w polu textarea. 3. Sprawdź stan przycisku "Generuj fiszki" i komunikaty walidacyjne.                                                       | Przycisk "Generuj fiszki" jest nieaktywny. Wyświetlany jest komunikat walidacyjny informujący o minimalnej wymaganej długości (np. "Tekst musi zawierać co najmniej 1000 znaków").                                                                              | Wysoki    |
| **GEN-UI-002**  | Wprowadzenie tekstu do generowania - walidacja długości (za długi)  | 1. Przejdź do `/generate`. 2. Wprowadź tekst dłuższy niż 10000 znaków w polu textarea. 3. Sprawdź stan przycisku "Generuj fiszki" i komunikaty walidacyjne.                                                      | Przycisk "Generuj fiszki" jest nieaktywny. Wyświetlany jest komunikat walidacyjny informujący o maksymalnej dozwolonej długości (np. "Tekst nie może przekraczać 10000 znaków").                                                                                | Wysoki    |
| **GEN-UI-003**  | Wprowadzenie tekstu do generowania - walidacja długości (poprawna)  | 1. Przejdź do `/generate`. 2. Wprowadź tekst o długości między 1000 a 10000 znaków. 3. Sprawdź stan przycisku "Generuj fiszki".                                                                                  | Przycisk "Generuj fiszki" jest aktywny. Brak komunikatów o błędach walidacji długości.                                                                                                                                                                          | Wysoki    |
| **GEN-API-001** | Wywołanie API `/api/flashcards/generate` z poprawnym tekstem        | 1. Wyślij żądanie POST do `/api/flashcards/generate` z poprawnym `input_text` (1000-10000 znaków) w body.                                                                                                        | API zwraca status 200 OK. Odpowiedź zawiera JSON z kluczem `proposals` będącym tablicą obiektów `{front: string, back: string}`. (Może zwracać mockowe dane, zgodnie z dokumentacją).                                                                           | Wysoki    |
| **GEN-API-002** | Wywołanie API `/api/flashcards/generate` z za krótkim tekstem       | 1. Wyślij żądanie POST do `/api/flashcards/generate` z `input_text` krótszym niż 1000 znaków.                                                                                                                    | API zwraca status 400 Bad Request. Odpowiedź zawiera JSON z opisem błędu walidacji.                                                                                                                                                                             | Wysoki    |
| **GEN-API-003** | Wywołanie API `/api/flashcards/generate` bez autoryzacji            | 1. Wyślij żądanie POST do `/api/flashcards/generate` bez prawidłowego tokena autoryzacyjnego (jeśli autoryzacja jest wymagana - obecnie RLS jest wyłączony, więc ten test może być N/A lub wymagać modyfikacji). | API zwraca status 401 Unauthorized (lub 200 OK, jeśli RLS/Auth jest faktycznie wyłączone dla tego endpointu).                                                                                                                                                   | Wysoki    |
| **GEN-API-004** | Wywołanie API `/api/flashcards/generate` - błąd serwisu AI          | 1. (Wymaga mockowania) Zasymuluj błąd odpowiedzi z `openrouter.service` (np. błąd sieci, błąd API OpenRouter). 2. Wyślij poprawne żądanie POST do `/api/flashcards/generate`.                                    | API zwraca odpowiedni status błędu (np. 500, 400, 429 w zależności od błędu AI). Odpowiedź zawiera JSON z opisem błędu. W tabeli `generation_errors_log` w Supabase pojawia się nowy wpis z detalami błędu.                                                     | Wysoki    |
| **GEN-API-005** | Wywołanie API `/api/flashcards/generate` - błąd parsowania AI       | 1. (Wymaga mockowania) Zasymuluj odpowiedź z `openrouter.service`, która ma niepoprawny format JSON. 2. Wyślij poprawne żądanie POST do `/api/flashcards/generate`.                                              | API zwraca status 400 Bad Request (lub 500). Odpowiedź zawiera JSON z opisem błędu parsowania. W tabeli `generation_errors_log` pojawia się wpis.                                                                                                               | Wysoki    |
| **PROP-UI-001** | Wyświetlanie wygenerowanych propozycji fiszek                       | 1. Na stronie `/generate`, po pomyślnym wygenerowaniu fiszek (nawet mockowych).                                                                                                                                  | Lista propozycji fiszek jest wyświetlana poniżej pola tekstowego. Każda propozycja zawiera widoczne `front` i `back` oraz przyciski "Edytuj", "Akceptuj", "Odrzuć".                                                                                             | Wysoki    |
| **PROP-UI-002** | Edycja propozycji fiszki                                            | 1. Na liście propozycji kliknij "Edytuj" przy jednej z fiszek. 2. Zmień tekst w polach `front` i/lub `back`. 3. Kliknij "Zapisz".                                                                                | Pola `front` i `back` stają się edytowalne (textarea). Po kliknięciu "Zapisz", zmiany są widoczne w karcie propozycji (stan komponentu React zostaje zaktualizowany).                                                                                           | Wysoki    |
| **PROP-UI-003** | Anulowanie edycji propozycji fiszki                                 | 1. Na liście propozycji kliknij "Edytuj". 2. Zmień tekst. 3. Kliknij "Anuluj".                                                                                                                                   | Pola wracają do trybu tylko do odczytu. Wyświetlana treść fiszki jest taka sama jak przed rozpoczęciem edycji.                                                                                                                                                  | Średni    |
| **PROP-UI-004** | Odrzucenie propozycji fiszki                                        | 1. Na liście propozycji kliknij "Odrzuć" przy jednej z fiszek.                                                                                                                                                   | Dana propozycja fiszki znika z listy.                                                                                                                                                                                                                           | Wysoki    |
| **PROP-UI-005** | Akceptacja propozycji fiszki (Frontend)                             | 1. Na liście propozycji kliknij "Akceptuj" przy jednej z fiszek. 2. Obserwuj zachowanie interfejsu i konsolę deweloperską.                                                                                       | Dana propozycja fiszki znika z listy. Wyświetlany jest toast o sukcesie ("Fiszka została zapisana!"). W konsoli sieciowej widoczne jest żądanie POST do `/api/flashcards` (które prawdopodobnie zakończy się błędem 404 z powodu braku endpointu backendowego). | Wysoki    |
| **DB-001**      | Poprawność migracji bazy danych                                     | 1. Uruchom `supabase db reset` (lub zastosuj migracje na czystej bazie). 2. Sprawdź strukturę bazy danych (tabele, kolumny, typy, relacje, indeksy) za pomocą narzędzi DB lub Supabase Studio.                   | Struktura bazy danych jest zgodna z definicjami w plikach migracji (`migrations/*.sql`) i `database.types.ts`. RLS jest wyłączone na tabelach (zgodnie z ostatnią migracją).                                                                                    | Średni    |
| **UI-001**      | Responsywność strony `/generate`                                    | 1. Otwórz stronę `/generate` w przeglądarce. 2. Zmień rozmiar okna przeglądarki (symulując różne urządzenia: desktop, tablet, mobile).                                                                           | Układ strony dostosowuje się poprawnie do różnych szerokości ekranu. Elementy nie nachodzą na siebie, są czytelne i użyteczne.                                                                                                                                  | Średni    |
| **ACC-001**     | Podstawowa nawigacja klawiaturą na `/generate`                      | 1. Otwórz stronę `/generate`. 2. Używaj klawisza Tab do nawigacji między elementami interaktywnymi (pole tekstowe, przycisk generowania, przyciski propozycji). 3. Używaj Enter/Spacja do aktywacji przycisków.  | Fokus jest wyraźnie widoczny i przemieszcza się w logicznej kolejności. Możliwe jest wywołanie akcji generowania i interakcji z propozycjami (edycja, odrzucenie) wyłącznie za pomocą klawiatury.                                                               | Średni    |

## 5. Harmonogram testów

- **Sprint 1 (Szacunkowo 1 tydzień):**
  - Konfiguracja środowiska testowego (lokalny Supabase, zmienne środowiskowe).
  - Testy jednostkowe dla serwisów (`flashcardsService`, `openrouter.service`) i walidatorów.
  - Testy API dla endpointu `/api/flashcards/generate` (pozytywne i negatywne scenariusze).
  - Testy integracyjne (API <-> Serwisy).
  - Podstawowe testy komponentów React (`GenerateFlashcardsView`, `FlashcardProposalCard`).
- **Sprint 2 (Szacunkowo 1 tydzień):**
  - Testy E2E dla przepływów autoryzacji (Rejestracja, Logowanie).
  - Testy E2E dla przepływu generowania fiszek (do momentu wyświetlenia propozycji i interakcji z nimi).
  - Testy UI (manualne testy responsywności, podstawowe testy wizualnej regresji).
  - Testy dostępności (automatyczne skanowanie, manualna nawigacja klawiaturą).
  - Testy eksploracyjne.
- **Testy regresji:** Przeprowadzane przed każdym wydaniem lub po wprowadzeniu znaczących zmian w kodzie.

## 6. Raportowanie i śledzenie błędów

- **Proces zgłaszania:** Wszystkie znalezione błędy będą zgłaszane w systemie śledzenia błędów (np. GitHub Issues).
- **Format zgłoszenia:**
  - Tytuł: Krótki, zwięzły opis problemu.
  - Opis: Szczegółowy opis błędu.
  - Kroki do reprodukcji: Dokładna sekwencja czynności prowadząca do wystąpienia błędu.
  - Wynik aktualny: Co się dzieje.
  - Wynik oczekiwany: Co powinno się dziać.
  - Środowisko: Wersja aplikacji, przeglądarka, system operacyjny.
  - Priorytet: (Krytyczny, Wysoki, Średni, Niski) - wpływ na funkcjonalność.
  - Ważność: (Blokujący, Poważny, Drobny, Trywialny) - wpływ na użytkownika.
  - Zrzuty ekranu/Wideo: Jeśli dotyczy.
  - Logi: Jeśli dostępne.
- **Kategoryzacja:** Błędy będą kategoryzowane według priorytetu i ważności.
- **Śledzenie:** Postęp w naprawie błędów będzie śledzony w systemie zgłoszeń. Regularne spotkania zespołu w celu omówienia statusu błędów krytycznych i wysokiego priorytetu.

## 7. Kryteria zakończenia testów

Testowanie zostanie uznane za zakończone, gdy spełnione zostaną następujące warunki:

- Wszystkie zdefiniowane przypadki testowe o priorytecie Wysokim i Krytycznym zostały wykonane.
- Procent przypadków testowych zakończonych sukcesem wynosi co najmniej 95% (dla priorytetów Wysokich i Krytycznych - 100%).
- Brak otwartych błędów o priorytecie Krytycznym.
- Liczba otwartych błędów o priorytecie Wysokim jest akceptowalna przez interesariuszy projektu (np. Product Ownera).
- Pokrycie kodu testami jednostkowymi i integracyjnymi osiągnęło zdefiniowany próg (np. 70%).
- Dokumentacja testowa (ten plan, raporty z testów) jest kompletna i zatwierdzona.

## 8. Zasoby i odpowiedzialności

- **Inżynier QA:** Odpowiedzialny za tworzenie i utrzymanie planu testów, projektowanie i wykonywanie przypadków testowych (manualnych i automatycznych), raportowanie błędów, komunikację statusu testów.
- **Deweloperzy:** Odpowiedzialni za pisanie testów jednostkowych i integracyjnych, naprawianie zgłoszonych błędów, wsparcie w konfiguracji środowiska testowego.
- **Product Owner/Manager:** Odpowiedzialny za definicję priorytetów, akceptację kryteriów zakończenia testów, podejmowanie decyzji dotyczących błędów o niższych priorytetach.

## 9. Ryzyka i plany awaryjne

| Ryzyko                                                     | Prawdopodobieństwo  | Wpływ  | Plan Awaryjny/Mitygacja                                                                                                                                                                                          |
| :--------------------------------------------------------- | :------------------ | :----- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Zależność od zewnętrznego API AI (OpenRouter)**          | Średnie             | Wysoki | Implementacja solidnego mockowania API do testów jednostkowych i integracyjnych. Wykorzystanie testów kontraktowych. Monitorowanie API OpenRouter. Przygotowanie na obsługę zmian w API lub jego niedostępności. |
| **Brakujący endpoint backendowy (`/api/flashcards` POST)** | Wysokie (istnieje)  | Wysoki | Priorytetyzacja implementacji brakującego endpointu przez zespół deweloperski. Do czasu implementacji, testowanie przepływu akceptacji tylko na poziomie frontendowym (UI + wywołanie `fetch`).                  |
| **Problemy z konfiguracją lokalnego środowiska Supabase**  | Niskie              | Średni | Stworzenie szczegółowej dokumentacji konfiguracji środowiska. Wykorzystanie Dockera do standaryzacji. Dedykowany czas na wsparcie konfiguracji.                                                                  |
| **Niestabilność lub błędy w bibliotekach zewnętrznych**    | Niskie              | Średni | Regularne aktualizacje zależności. Monitorowanie zgłoszeń błędów w repozytoriach bibliotek. W razie potrzeby, przypięcie wersji lub poszukiwanie alternatyw.                                                     |
| **Opóźnienia w dostarczaniu poprawek błędów**              | Średnie             | Średni | Regularna komunikacja z zespołem deweloperskim. Priorytetyzacja naprawy błędów blokujących. Jasne raportowanie wpływu błędów na postęp testów.                                                                   |
| **Ponowne włączenie RLS w Supabase**                       | Wysokie (planowane) | Wysoki | Zaplanowanie dodatkowego cyklu testów bezpieczeństwa skoncentrowanego na RLS po jego włączeniu. Aktualizacja istniejących przypadków testowych API i E2E w celu uwzględnienia reguł RLS.                         |
| **Niejednoznaczne wymagania lub zmiany w trakcie sprintu** | Średnie             | Średni | Regularna komunikacja z Product Ownerem. Utrzymanie aktualnej dokumentacji (np. PRD). Elastyczne podejście do aktualizacji planu i przypadków testowych.                                                         |
```
