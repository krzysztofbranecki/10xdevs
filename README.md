# 10x-cards

## Project Description

10x-cards is a flashcards management application that helps users quickly create, manage, and study educational flashcards. The application leverages AI to generate suggestions for flashcards based on provided text, enabling efficient spaced repetition learning. Users can manually create flashcards, edit generated ones, and manage their study sessions with ease.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, authentication & real-time capabilities)
- **AI:** Openrouter AI API integration for generating flashcard suggestions

## Getting Started Locally

### Prerequisites

- Node.js version as specified in `.nvmrc` (`22.14.0`)
- [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd 10x-cards
   ```
2. Install the required Node version:
   ```bash
   nvm install
   nvm use
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

## Available Scripts

- `npm run dev` – Starts the Astro development server.
- `npm run build` – Builds the project for production.
- `npm run preview` – Previews the production build locally.
- `npm run astro` – Runs Astro CLI commands.
- `npm run lint` – Runs ESLint for code quality checks.
- `npm run lint:fix` – Automatically fixes linting issues.
- `npm run format` – Formats code using Prettier.

## Project Scope

The project aims to provide the following features:

- **Automated Flashcard Generation:** Use AI to generate flashcard suggestions from input text.
- **Manual Flashcard Management:** Create, edit, and delete flashcards manually.
- **Spaced Repetition Scheduling:** Integrate a spaced repetition algorithm for effective study sessions.
- **User Authentication:** Allow users to register, log in, and manage their flashcards securely.
- **Monitoring & Reporting:** Track the number of flashcards generated and accepted.

## Project Status

The project is currently in the MVP stage and is under active development. Future enhancements and iterations are planned based on user feedback and performance metrics.

## License

This project is licensed under the MIT License.
