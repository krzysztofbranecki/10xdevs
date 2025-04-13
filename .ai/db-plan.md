# Schemat bazy danych - 10x-cards

## 1. Tabele

### users

- **id**: UUID PRIMARY KEY
- **email**: VARCHAR NOT NULL UNIQUE
- **created_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- **encrypted_password**: TEXT NOT NULL
- **confirmed_at**: TIMESTAMP WITH TIME ZONE

_Indeksy:_ Unikalny indeks na kolumnie email.

_Uwagi:_ Tabela zarządzana przez Supabase oraz stosowana jako referencja w innych tabelach.

---

### flashcards

- **id**: UUID PRIMARY KEY
- **front**: VARCHAR(200) NOT NULL
- **back**: VARCHAR(500) NOT NULL
- **source_id**: UUID REFERENCES source(id) ON DELETE CASCADE
- **generation_id**: UUID REFERENCES generations(id) ON DELETE CASCADE
- **user_id**: UUID REFERENCES users(id) ON DELETE CASCADE
- **created_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

_Indeksy:_ Indeksy na kolumnach: user_id, source_id, generation_id.

_RLS:_ Dostęp ograniczony do wierszy, gdzie user_id = bieżący użytkownik.

---

### source

- **id**: UUID PRIMARY KEY
- **model**: VARCHAR NOT NULL
- **text_hash**: VARCHAR NOT NULL
- **length**: INTEGER NOT NULL CHECK (length BETWEEN 1000 AND 10000)
- **source_type**: VARCHAR NOT NULL CHECK (source_type IN ('ai-full', 'ai-edited', 'manula'))
- **user_id**: UUID REFERENCES users(id) ON DELETE CASCADE
- **created_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

_Indeksy:_ Indeks na kolumnie user_id.

_RLS:_ Dostęp ograniczony do wierszy, gdzie user_id = bieżący użytkownik.

---

### generations

- **id**: UUID PRIMARY KEY
- **user_id**: UUID REFERENCES users(id) ON DELETE CASCADE
- **source_id**: UUID REFERENCES source(id) ON DELETE CASCADE
- **generated_count**: INTEGER NOT NULL DEFAULT 0 CHECK (generated_count >= 0)
- **accepted_unedited_count**: INTEGER NOT NULL DEFAULT 0 CHECK (accepted_unedited_count >= 0)
- **accepted_edited_count**: INTEGER NOT NULL DEFAULT 0 CHECK (accepted_edited_count >= 0)
- **created_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

_Indeksy:_ Indeksy na kolumnach: user_id, source_id.

_RLS:_ Dostęp ograniczony do wierszy, gdzie user_id = bieżący użytkownik.

---

### generation_errors_log

- **id**: UUID PRIMARY KEY
- **user_id**: UUID REFERENCES users(id) ON DELETE CASCADE
- **source_id**: UUID REFERENCES source(id) ON DELETE CASCADE
- **error_code**: VARCHAR NOT NULL
- **error_message**: TEXT NOT NULL
- **created_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

_Indeksy:_ Indeksy na kolumnach: user_id, source_id.

_RLS:_ Dostęp ograniczony do wierszy, gdzie user_id = bieżący użytkownik.

---

## 2. Relacje między tabelami

- `flashcards.user_id` → `users.id` (ON DELETE CASCADE)
- `flashcards.source_id` → `source.id` (ON DELETE CASCADE)
- `flashcards.generation_id` → `generations.id` (ON DELETE CASCADE)
- `source.user_id` → `users.id` (ON DELETE CASCADE)
- `generations.user_id` → `users.id` (ON DELETE CASCADE)
- `generations.source_id` → `source.id` (ON DELETE CASCADE)
- `generation_errors_log.user_id` → `users.id` (ON DELETE CASCADE)
- `generation_errors_log.source_id` → `source.id` (ON DELETE CASCADE)

---

## 3. Indeksy

- Unikalny indeks na `users.email`.
- Indeksy na kolumnach kluczy obcych: `user_id`, `source_id` oraz `generation_id` tam, gdzie występują.

---

## 4. Zasady PostgreSQL (RLS)

W tabelach, które zawierają kolumnę `user_id` (flashcards, source, generations, generation_errors_log), należy wdrożyć zasady Row-Level Security (RLS), aby użytkownik miał dostęp tylko do swoich danych. Przykładowa polityka RLS:

```sql
CREATE POLICY user_policy ON flashcards
  USING (user_id = current_setting('app.current_user_id')::uuid);
```

_Podobne polityki należy wdrożyć dla tabel: source, generations i generation_errors_log._

---

## 5. Dodatkowe uwagi

- Schemat stosuje typ UUID dla kluczy głównych, co jest zgodne z architekturą Supabase.
- Kolumny audytowe (`created_at`, `updated_at`) zostały dodane do wszystkich tabel, gdzie ma to zastosowanie, aby umożliwić śledzenie zmian.
- Wszystkie relacje FK korzystają z reguły ON DELETE CASCADE, gwarantując automatyczne usuwanie powiązanych rekordów przy usunięciu rekordu nadrzędnego.
- Schemat jest zoptymalizowany pod kątem PostgreSQL oraz integracji z wybranym stackiem technologicznym (Astro, React, Tailwind, Shadcn/ui, Supabase).
