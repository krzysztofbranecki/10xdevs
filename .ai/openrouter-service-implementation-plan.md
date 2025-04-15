# Przewodnik implementacji usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter to usługa oparta na TypeScript, która umożliwia komunikację z API OpenRouter, zapewniając funkcjonalność czatu opartego na LLM. Zapewnia solidny interfejs do wysyłania wiadomości, zarządzania konwersacjami i obsługi odpowiedzi, jednocześnie gwarantując odpowiednią obsługę błędów i bezpieczeństwo.

## 2. Opis konstruktora

```typescript
interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  maxRetries?: number;
  timeout?: number;
}

class OpenRouterService {
  constructor(config: OpenRouterConfig) {
    // Szczegóły implementacji
  }
}
```

## 3. Publiczne metody i pola

### 3.1 Metody

```typescript
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  message: string;
  confidence: number;
}

class OpenRouterService {
  public async sendMessage(
    messages: ChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      responseFormat?: ResponseFormat;
    }
  ): Promise<ChatResponse>;

  public async getAvailableModels(): Promise<string[]>;

  public async validateMessage(message: ChatMessage): Promise<boolean>;

  public async getUsageStats(): Promise<UsageStats>;
}
```

### 3.2 Pola

```typescript
class OpenRouterService {
  public readonly config: OpenRouterConfig;
  public readonly isConnected: boolean;
  public readonly lastError?: Error;
}
```

## 4. Prywatne metody i pola

```typescript
class OpenRouterService {
  private async validateResponse(response: any): Promise<boolean>;
  private async handleError(error: Error): Promise<void>;
  private async retryRequest<T>(fn: () => Promise<T>): Promise<T>;
  private async validateSchema(schema: any, data: any): Promise<boolean>;
}
```

## 5. Obsługa błędów

### 5.1 Typy błędów

```typescript
enum OpenRouterErrorType {
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR'
}

class OpenRouterError extends Error {
  constructor(
    public type: OpenRouterErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}
```

### 5.2 Strategia obsługi błędów

1. Implementacja wykładniczego wycofywania dla ponownych prób
2. Logowanie błędów z odpowiednimi poziomami ważności
3. Dostarczanie przyjaznych dla użytkownika komunikatów o błędach
4. Utrzymywanie statystyk błędów do monitorowania

## 6. Zagadnienia bezpieczeństwa

1. Zarządzanie kluczami API
   - Przechowywanie kluczy API w zmiennych środowiskowych
   - Używanie bezpiecznej rotacji kluczy
   - Implementacja monitorowania użycia kluczy

2. Ochrona danych
   - Szyfrowanie wrażliwych danych w trakcie przesyłania
   - Implementacja podpisywania żądań
   - Walidacja wszystkich danych wejściowych

3. Ograniczanie liczby żądań
   - Implementacja ograniczania po stronie klienta
   - Monitorowanie użycia API
   - Łagodna obsługa błędów związanych z limitem

## 7. Plan implementacji krok po kroku

### 7.1 Konfiguracja i ustawienia

1. Utworzenie struktury katalogów usługi:
```
src/
  lib/
    openrouter/
      service.ts
      types.ts
      errors.ts
      utils.ts
```

2. Instalacja zależności:
```bash
npm install axios zod @types/node
```

3. Konfiguracja zmiennych środowiskowych:
```env
OPENROUTER_API_KEY=twój_klucz_api
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
DEFAULT_MODEL=anthropic/claude-3-opus
```

### 7.2 Kroki implementacji

1. Utworzenie interfejsów i typów TypeScript
2. Implementacja podstawowej klasy usługi
3. Dodanie funkcjonalności obsługi wiadomości
4. Implementacja walidacji odpowiedzi
5. Dodanie obsługi błędów
6. Implementacja mechanizmu ponownych prób


### 7.3 Przykład użycia

```typescript
const openRouter = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultModel: 'anthropic/claude-3-opus'
});

const response = await openRouter.sendMessage([
  {
    role: 'system',
    content: 'Jesteś pomocnym asystentem.'
  },
  {
    role: 'user',
    content: 'Cześć, jak się masz?'
  }
], {
  temperature: 0.7,
  maxTokens: 1000,
  responseFormat: {
    type: 'json_schema',
    json_schema: {
      name: 'chatResponse',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          confidence: { type: 'number' }
        }
      }
    }
  }
});
```

## 8. Najlepsze praktyki

1. Zawsze waliduj dane wejściowe
2. Implementuj odpowiednią obsługę błędów
3. Używaj TypeScript dla bezpieczeństwa typów
4. Stosuj najlepsze praktyki bezpieczeństwa
5. Monitoruj użycie API i wydajność
6. Utrzymuj zależności w aktualnej wersji
7. Dokumentuj wszystkie metody publiczne
8. Pisz kompleksowe testy 