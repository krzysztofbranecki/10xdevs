# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Aplikacja 10x-cards została zaprojektowana jako nowoczesna, responsywna aplikacja webowa z modułową strukturą. Interfejs użytkownika jest zorganizowany wokół głównych funkcjonalności: generowania fiszek przez AI, zarządzania fiszkami i sesji nauki. Wykorzystuje komponenty z biblioteki shadcn/ui dla spójnego i dostępnego interfejsu.

## 2. Lista widoków

### Widok autoryzacji (/auth)
- **Główny cel**: Rejestracja i logowanie użytkowników
- **Kluczowe informacje**: Formularze rejestracji i logowania
- **Kluczowe komponenty**: 
  - Form z walidacją
  - Alert dla błędów
  - Button dla akcji
- **UX i bezpieczeństwo**:
  - Walidacja danych w czasie rzeczywistym
  - Bezpieczne przechowywanie danych uwierzytelniających
  - Przejrzyste komunikaty błędów

### Dashboard (/)
- **Główny cel**: Centralny punkt aplikacji z szybkim dostępem do głównych funkcji
- **Kluczowe informacje**: 
  - Statystyki generowania fiszek
  - Ostatnio dodane fiszki
  - Szybkie akcje
- **Kluczowe komponenty**:
  - Card dla statystyk
  - Table dla ostatnich fiszek
  - NavigationMenu dla nawigacji
- **UX i dostępność**:
  - Intuicyjny układ
  - Szybki dostęp do głównych funkcji
  - Responsywny design

### Widok generowania fiszek (/generate)
- **Główny cel**: Generowanie fiszek z tekstu przy użyciu AI
- **Kluczowe informacje**:
  - Pole tekstowe do wprowadzania treści
  - Lista wygenerowanych propozycji
  - Status generowania
- **Kluczowe komponenty**:
  - Textarea z limitem znaków
  - Card dla propozycji fiszek
  - Button dla akcji
  - Toast dla powiadomień
- **UX i dostępność**:
  - Walidacja długości tekstu
  - Wizualna informacja o postępie
  - Możliwość edycji propozycji

### Widok moich fiszek (/flashcards)
- **Główny cel**: Zarządzanie fiszkami użytkownika
- **Kluczowe informacje**:
  - Lista wszystkich fiszek
  - Możliwość filtrowania i wyszukiwania
  - Statystyki dla fiszek
- **Kluczowe komponenty**:
  - Table z paginacją
  - Modal do edycji
  - Dialog do potwierdzenia usunięcia
  - Search dla wyszukiwania
- **UX i dostępność**:
  - Efektywne filtrowanie
  - Potwierdzenie nieodwracalnych akcji
  - Responsywny układ tabeli

### Widok sesji nauki (/study)
- **Główny cel**: Nauka z wykorzystaniem algorytmu powtórek
- **Kluczowe informacje**:
  - Bieżąca fiszka
  - Postęp sesji
  - Statystyki nauki
- **Kluczowe komponenty**:
  - Card dla fiszki
  - Progress dla postępu
  - Button dla oceny
- **UX i dostępność**:
  - Prosty interfejs skupiony na nauce
  - Klawiszologia dla szybkiej oceny
  - Wizualne wskazówki postępu

### Widok profilu (/profile)
- **Główny cel**: Zarządzanie ustawieniami konta
- **Kluczowe informacje**:
  - Dane użytkownika
  - Preferencje aplikacji
  - Opcje bezpieczeństwa
- **Kluczowe komponenty**:
  - Form dla danych
  - Switch dla preferencji
  - Button dla akcji
- **UX i bezpieczeństwo**:
  - Potwierdzenie zmian
  - Bezpieczne zarządzanie kontem
  - Jasne komunikaty o zmianach

## 3. Mapa podróży użytkownika

1. **Rejestracja/Logowanie**
   - Użytkownik wchodzi na stronę
   - Wybiera rejestrację lub logowanie
   - Po pomyślnej autoryzacji przechodzi do dashboardu

2. **Dashboard**
   - Przegląd statystyk i ostatnich fiszek
   - Szybki dostęp do głównych funkcji
   - Możliwość przejścia do dowolnego modułu

3. **Generowanie fiszek**
   - Wprowadzenie tekstu
   - Generowanie propozycji
   - Przegląd i akceptacja fiszek
   - Automatyczne dodanie do bazy

4. **Zarządzanie fiszkami**
   - Przegląd wszystkich fiszek
   - Filtrowanie i wyszukiwanie
   - Edycja lub usuwanie
   - Eksport/import

5. **Sesja nauki**
   - Rozpoczęcie sesji
   - Przegląd fiszek
   - Ocena znajomości
   - Podsumowanie sesji

## 4. Układ i struktura nawigacji

- **Główna nawigacja**:
  - NavigationMenu z shadcn/ui
  - Stałe elementy: Dashboard, Generuj, Moje fiszki, Nauka, Profil
  - Responsywny układ z hamburger menu na mobile

- **Nawigacja kontekstowa**:
  - Breadcrumbs dla głębszych widoków
  - Przyciski powrotu w modalach
  - Szybkie linki w dashboardzie

- **Dostępność**:
  - Obsługa klawiatury
  - ARIA labels
  - Kontrast i czytelność

## 5. Kluczowe komponenty

### Card
- Wykorzystywany do wyświetlania fiszek
- Responsywny układ
- Obsługa interakcji (klik, hover)

### Modal
- Do edycji fiszek
- Potwierdzenia akcji
- Formularze

### Toast
- Powiadomienia o statusie operacji
- Komunikaty błędów
- Potwierdzenia sukcesu

### Table
- Lista fiszek
- Paginacja
- Sortowanie i filtrowanie

### Form
- Walidacja danych
- Obsługa błędów
- Dostępność

### NavigationMenu
- Główna nawigacja
- Responsywny układ
- Obsługa klawiatury 