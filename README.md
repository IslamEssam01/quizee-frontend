# Quizee

Frontend for **Quizee**, a quiz creation and grading platform. Create quizzes, share them (public, link-only, or invite-only), take attempts, and review scores.

Backend: [quizee-api](https://github.com/IslamEssam01/quizee-api) (FastAPI + PostgreSQL).

## Features

- Auth: register, login, forgot/reset password, session handling with automatic refresh-token rotation.
- Quiz builder: create/edit quizzes, question/answer editing (JSON-backed), visibility control, access grants.
- Taking quizzes: anonymous or logged-in attempts, optional question/answer shuffling, resumable attempts.
- Dashboards: "My quizzes", "My attempts", profile management.

## Stack

React 19 · TypeScript · Vite · TanStack Router · TanStack Query · Tailwind CSS v4 · shadcn/ui (Base UI primitives) · CodeMirror (JSON question editing) · React Compiler · Deployed on Cloudflare via Wrangler

## Running locally

Requires Node/Bun and the [quizee-api](../quizee-api) backend running.

```bash
bun install
cp .env.example .env   # set VITE_API_URL to the backend's URL, e.g. http://localhost:8000/api
bun run dev
```

## Build

```bash
bun run build   # type-checks then builds to dist/
bun run preview
```

## Lint

```bash
bun run lint
```

## Roadmap

See the [backend roadmap](https://github.com/IslamEssam01/quizee-api#roadmap) — user groups, quiz groups, quiz timers, and banning users/groups from a quiz will need frontend support once implemented on the API.
