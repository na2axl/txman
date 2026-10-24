# Transaction Manager

This project is the result of my technical assessment for Ejara: a small full-stack transaction management system.
It is a NestJS REST API on PostgreSQL and a React admin dashboard where a user can create transactions, browse them
(search,
filter, sort, paginate) and approve or reject them.
- **Backend:** NestJS 12, TypeScript, Drizzle ORM, PostgreSQL 17, zod, JWT auth, Swagger/OpenAPI
- **Frontend:** React 19, Vite (SPA), TanStack Router / Query / Table / Form, shadcn/ui, Tailwind 4
- **Tooling:** bun workspaces, Biome, Vitest, Podman/Docker Compose (production)

| Document                               | What it covers                                                              |
| -------------------------------------- | --------------------------------------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)   | My key decisions, where the business rules live, trade-offs and assumptions |
| [docs/database.md](./docs/database.md) | Schema, constraints, indexes, migration and seed strategy                   |
| Swagger UI (running API)               | Interactive API docs at `/api/docs`, see below                              |

## Run everything with Compose

You need Podman (`podman compose`) or Docker (`docker compose`).

```bash
podman compose up -d --build      # or: docker compose up -d --build
```

This starts PostgreSQL, runs the migrations and the seed in a one-shot
`migrate` container, then starts the API and the dashboard.

| Service                           | URL                                 |
| --------------------------------- | ----------------------------------- |
| Dashboard                         | http://localhost:5173               |
| API                               | http://localhost:3000/api/v1        |
| Interactive API docs (Swagger UI) | http://localhost:3000/api/docs      |
| Raw OpenAPI document              | http://localhost:3000/api/docs.json |

**Demo login:** `admin` / `admin1234`

The seeder adds 25 customers and 200 transactions (about 50% pending, 35%
approved, 15% rejected) spread over the last 90 days. It is skipped when the
database already contains transactions, so running it multiple times is safe.
To start over, remove the volume: `podman compose down -v`.

## Local development

To run the project for development, you need [bun](https://bun.sh) and a
container runtime for PostgreSQL.

```bash
bun install

podman compose up -d postgres            # PostgreSQL on localhost:5432

cp backend/.env.example backend/.env     # database + JWT settings
cd backend
bun run db:migrate                       # apply migrations
bun run db:seed                          # load demo data
cd ..

bun run dev:backend                      # API on http://localhost:3000
bun run dev:frontend                     # dashboard on http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:3000` (override with
`API_PROXY_TARGET`), so the browser only talks to one origin, allowing me to not setup CORS.

### Environment variables (`backend/.env`)

| Variable                                                | Default                                                        | Notes                                                                  |
| ------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `APP_PORT`                                              | `3000`                                                         | API port                                                               |
| `DATABASE_HOST` / `PORT` / `NAME` / `USER` / `PASSWORD` | `localhost` / `5432` / `ejara_txman` / `postgres` / `postgres` | Used by the API. `.env.example` matches the compose database (`ejara`) |
| `DATABASE_URL`                                          | none                                                           | Used by `drizzle-kit` (migrations) and the seed script                 |
| `JWT_SECRET`                                            | **required**                                                   | At least 32 characters; startup fails without it                       |
| `JWT_EXPIRES_IN`                                        | `3600`                                                         | Access token lifetime in seconds                                       |

## Repository layout

```
backend/
  src/
    common/        shared HTTP pieces (error filter, logging), money helpers, OpenAPI setup
    config/        env validation (zod) and typed config
    db/            Drizzle schema (finances, iam), seed script
    iam/           authentication: login, JWT guard, users
    customers/     customer lookup
    transactions/  controller, service, schemas, status state machine
  drizzle/         generated SQL migrations
  test/            e2e tests
frontend/
  src/
    api/           transport, resources (wire types), models (UI), queries (TanStack Query)
    features/      transactions list, details and form
    components/    shared and shadcn/ui components
    routes/        file-based TanStack Router routes
docs/              database documentation
bruno/             Bruno collection for the API
```
