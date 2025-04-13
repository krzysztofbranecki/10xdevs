# REST API Plan

## 1. Resources

- **Users**: Represents user accounts.
  - Based on the `users` table. Fields include: `id`, `email`, `encrypted_password`, `created_at`, and optional `confirmed_at`.

- **Flashcards**: Represents flashcards created or generated for study.
  - Based on the `flashcards` table. Fields include: `id`, `front`, `back`, `source_id`, `generation_id`, `user_id`, etc.

- **Source**: Represents the source content from which flashcards might be generated.
  - Based on the `source` table. Contains: `id`, `model`, `text_hash`, `length`, `source_type`, `user_id`, etc.

- **Generations**: Tracks AI generation metadata.
  - Based on the `generations` table. Contains counts for generated/accepted flashcards and references to `user_id` and `source_id`.

- **Generation Errors Log**: Records errors occurring during AI generation.
  - Based on the `generation_errors_log` table. Contains error details such as `error_code`, `error_message` and references to `user_id` and `source_id`.

## 2. Endpoints

### 2.1 Flashcards Endpoints

- **GET /api/flashcards**
  - *Description*: Retrieve a paginated list of flashcards for the authenticated user.
  - *Query Parameters*:
    - `page` (number, optional): for pagination.
    - `per_page` (number, optional): to set page size.
    - `sort_by` (string, optional): field to sort by.
    - `order` (string, optional): "asc" or "desc".
    - `search` (string, optional): text filter.
  - *Response*:
    ```json
    {
      "flashcards": [
        { "id": "uuid", "front": "text", "back": "text", "user_id": "uuid", ... }
      ],
      "pagination": { "page": 1, "per_page": 10, "total": 50 }
    }
    ```
  - *Success Codes*: 200 OK.
  - *Error Codes*: 401 Unauthorized.

- **GET /api/flashcards/{id}**
  - *Description*: Retrieve details for a specific flashcard.
  - *Response*:
    ```json
    {
      "id": "uuid",
      "front": "text",
      "back": "text",
      "user_id": "uuid",
      "source_id": "uuid",
      "generation_id": "uuid"
    }
    ```
  - *Success Codes*: 200 OK.
  - *Error Codes*: 401 Unauthorized, 404 Not Found.

- **POST /api/flashcards**
  - *Description*: Create a new flashcard (manual creation or accepted AI-generated flashcard).
  - *Request Body*:
    ```json
    {
      "front": "Flashcard front text",
      "back": "Flashcard back text",
      "source_id": "uuid (optional)",
      "generation_id": "uuid (optional)"
    }
    ```
  - *Response*:
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
  - *Success Codes*: 201 Created.
  - *Error Codes*: 400 Bad Request, 401 Unauthorized.

- **PUT /api/flashcards/{id}**
  - *Description*: Update an existing flashcard.
  - *Request Body*:
    ```json
    {
      "front": "Updated flashcard front",
      "back": "Updated flashcard back"
    }
    ```
  - *Response*:
    ```json
    {
      "id": "uuid",
      "front": "Updated flashcard front",
      "back": "Updated flashcard back",
      "updated_at": "timestamp"
    }
    ```
  - *Success Codes*: 200 OK.
  - *Error Codes*: 400 Bad Request, 401 Unauthorized, 404 Not Found.

- **DELETE /api/flashcards/{id}**
  - *Description*: Delete a specific flashcard.
  - *Response*:
    ```json
    { "message": "Flashcard successfully deleted." }
    ```
  - *Success Codes*: 200 OK.
  - *Error Codes*: 401 Unauthorized, 404 Not Found.

### 2.2 AI Generation Endpoints

- **POST /api/flashcards/generate**
  - *Description*: Generate flashcard proposals using AI from provided text.
  - *Request Body*:
    ```json
    {
      "input_text": "Text between 1000 and 10000 characters",
      "additional_options": { "model": "optional-model-name" }
    }
    ```
  - *Response*:
    ```json
    {
      "proposals": [
        { "front": "Proposed question", "back": "Proposed answer" },
        ...
      ]
    }
    ```
  - *Validation*: Ensures `input_text` length is within the allowed range.
  - *Success Codes*: 200 OK.
  - *Error Codes*: 400 Bad Request, 401 Unauthorized, 500 Internal Server Error (if AI generation fails).

## 3. Authentication & Authorization

- The API will use token-based authentication (e.g., JWT) issued on login and registration.
- Middleware will enforce authentication on all endpoints except for `/api/auth/register` and `/api/auth/login`.
- Row-Level Security (RLS) is applied based on the `user_id` field, ensuring users can only access their own data.
- Endpoints may also include role-based access restrictions for administrative operations.

## 4. Validation and Business Logic

- **Data Validations**:
  - *Users*: Ensure unique, valid email format and strong password upon registration.
  - *Flashcards*: Validate required fields (`front` and `back`). Enforce maximum length constraints as needed.
  - *AI Generation*: Validate that the `input_text` length is between 1000 and 10000 characters as specified in the schema.

- **Business Logic**:
  - After AI generation, proposals are not directly persisted. Users review proposals and create flashcards manually if accepted.
  - Maintain counts and logs associated with AI generation in the `generations` and `generation_errors_log` tables.
  - For every modification, ensure that the authenticated user's ID matches the `user_id` field in the database record (as enforced by RLS and middleware).

- **Error Handling**:
  - Return clear error messages with appropriate HTTP status codes for validation errors.
  - Log AI generation errors into `generation_errors_log` for further analysis.

## 5. Pagination, Filtering, and Sorting

- Endpoints that return lists (e.g., `/api/flashcards`, `/api/users`) will support:
  - Pagination: via `page` and `per_page` query parameters.
  - Filtering: via a `search` parameter to filter by text content.
  - Sorting: via `sort_by` and `order` parameters (e.g., sorting flashcards by creation date).

## 6. Rate Limiting and Security

- Implement rate limiting on API endpoints to safeguard against abuse.
- Use HTTPS, employ proper CORS policies, and ensure input sanitization to prevent common web vulnerabilities.
- Implement logging and monitoring for both successful requests and errors.

## 7. Error Handling

- **HTTP Status Codes**:
  - 200 OK, 201 Created for successful operations.
  - 400 Bad Request for validation errors.
  - 401 Unauthorized for authentication issues.
  - 403 Forbidden for unauthorized access attempts.
  - 404 Not Found when a resource does not exist.
  - 500 Internal Server Error for unexpected failures.

- **Error Response Format**:
  ```json
  {
    "error": "Error description",
    "error_code": 401,
    "details": "Optional additional details"
  }
  ``` 