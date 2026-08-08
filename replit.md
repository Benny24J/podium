# Podium

Podium helps people practice public speaking by researching a random topic under pressure, recording a timed take, and reviewing their progress.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/podium` — the responsive Podium web app and browser recording flow
- `artifacts/api-server` — topic bank and session history API
- `lib/api-spec/openapi.yaml` — source of truth for the API contract
- `lib/db/src/schema/podium.ts` — PostgreSQL topic and session tables
- `artifacts/api-server/src/lib/podium-seed.ts` — idempotent seed for the supplied topic bank

## Architecture decisions

- The first build uses a stable browser session key rather than local passwords or unapproved authentication, keeping history scoped to the current browser.
- Topic content is seeded into PostgreSQL and served through the API so categories and prompts can grow without UI changes.
- Recordings use browser `getUserMedia` and `MediaRecorder`; the current preview keeps the recording blob local while saving session metadata through the API.

## Product

Users can browse a broad topic bank, shuffle a prompt, choose research and speaking timers, review suggested angles, grant camera/microphone permission, record a timed video take, play it back, save metadata, and revisit session history.

## User preferences

No additional preferences recorded.

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`.
- Replit preview workflows provide the required `PORT` and `BASE_PATH`; do not run the Vite app from the workspace root.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
