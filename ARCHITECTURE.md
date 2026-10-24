# Architecture

This document explains the main decisions I made, and what I deliberately left out.

## Overview

```
Browser ──► nginx (static SPA, /api proxy) ──► NestJS API ──► PostgreSQL
              │                                  │
              └─ React + TanStack                └─ modules: iam, customers, transactions
```

- The backend is a **modular monolith**: one deployable API, split into feature
  modules that own their data and their code.
- The dashboard is a **single-page app served as static files**. nginx (and the
  Vite dev server) proxy `/api` to the API, so the browser sees one origin.
- **PostgreSQL** is the system of record, with **Drizzle** as the ORM. I generated the migrations with `drizzle-kit`.

## Backend

### Module organization

| Module         | Responsibility                                                                       |
| -------------- | ------------------------------------------------------------------------------------ |
| `iam`          | Login, JWT verification (global guard), users                                        |
| `customers`    | Customer lookup for the form and the list filter                                     |
| `transactions` | Create, list, read and change the status of transactions                             |
| `common`       | Cross-cutting HTTP code: error filter, request logging, money helpers, OpenAPI setup |
| `config`       | Environment validation with zod and typed config access                              |
| `db`           | Drizzle schema (one Postgres schema per module) and the seed script                  |

Inside a module I keep the layers thin:
- **Controller**: routing, decorators, response status.
- **Schemas** (zod): request validation and the public response shape.
- **Service**: use cases, transactions, and mapping domain errors to HTTP errors.
- **Pure domain code** (i.e. `transaction-status.ts`): has no Nest or database imports.

I did not add a repository layer. Drizzle's query builder is already a typed
data access API, and the services are its only callers, so another abstraction
would only add indirection without a second implementation to justify it.

### Standard Schema Validation

I chose Standard Schema validation instead of NestJS's default
`class-validator` approach because it offers faster validation and stronger
typings. With `class-validator`, a DTO is a class whose properties each carry a
TypeScript annotation AND validation decorators, so nothing stops the two from
disagreeing (`@IsString() age: number` compiles). With a schema, the validation
and the TypeScript type come from one definition, so they cannot disagree. I write
the schemas with zod, but Nest's built-in `StandardSchemaValidationPipe` only relies
on the Standard Schema interface, so the validation layer is not tied to a single schema library.

Every request and response shape is a zod schema, and the TypeScript type is inferred from it. That single definition
drives:
1. **Runtime validation**: `@Body({ schema })`, `@Query({ schema })` and `@Param('id', { schema })` use Nest's built-in
   standard-schema validation pipe.
2. **Static types**: `z.infer` generates the corresponding type so a controller cannot return a shape that differs from
   its documentation.
3. **OpenAPI**: `@nestjs/swagger` reads the same schemas, so the documented contract cannot drift from what is
   validated.

### Business Rules

| Rule                                                                             | Enforced in                                                                                      | Why                                                                                                                                                                           |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New transactions start `PENDING`                                                 | Database column default, since the create schema has no `status` field                           | A client cannot choose a status                                                                                                                                               |
| Reference required, unique, 22 chars in the `TX{YYYYMMDDHHmmSS}{6 chars}` format | zod schema, then a `CHECK` and a `UNIQUE` constraint in the database                             | The schema gives a fast, friendly error. The database is the final guard against races and other writers                                                                      |
| Customer name required, amount positive, currency a valid ISO code               | zod schema (amount and currency validated with Dinero), plus `CHECK` constraints in the database | Same layering                                                                                                                                                                 |
| **Only `PENDING → APPROVED` and `PENDING → REJECTED`** transitions               | `transaction-status.ts`  called by `TransactionsService.updateStatus`                            | These rules are domain logic, so I kept them independent of HTTP and unit-testable. Invalid moves raise `InvalidStatusTransitionError`, which the global filter maps to `409` |
| Two reviewers cannot both decide                                                 | `UPDATE … WHERE id = $1 AND status = $current`                                                   | The check-then-write is atomic: if the row changed in between, zero rows update and the API answers `409`. I tested it with 4 concurrent requests and only one succeeded      |

The frontend never decides which transitions are legal. Every transaction
response carries `allowed_transitions`, and the UI renders its **Approve** and **Reject** buttons from that list. If I
change a rule in the backend, the UI follows
without a frontend change, and a hand-crafted request still hits the backend rule.

### Error handling

I chose RFC 9457 (problem details for HTTP APIs) for errors because it is a
published standard instead of an error envelope I would have invented myself.
It gives every client the same, predictable shape and a registered media type (`application/problem+json`), it lets us
add my own fields (`errors`,
`request_id`) as extension members without breaking the format, and it means
the frontend needs just one error parser for every query.

One exception filter turns every error into that format with the same fields (`type`, `title`, `status`, `detail`,
`instance`, `request_id`). Validation failures are `422` and add a
per-field `errors` list, which the dashboard maps onto form fields. I translate
database unique and foreign-key violations to `409` and `422`; anything
unexpected is logged server-side and returned as a generic `500` with no
internals. Every request gets an `x-request-id` that appears in the log line and
in the error body.

### Authentication

`POST /auth/login` exchanges a username and password for an HS256 JWT. A global
guard protects every route unless it is marked `@Public()` (login and the health
check). Passwords are hashed with scrypt, and an unknown username still goes through
a hash comparison so response time does not reveal which usernames exist. The
guard pins the algorithm when it verifies a token.

I kept the scope small on purpose: no roles, registration, refresh tokens or
password reset. Login is a gate in front of the dashboard, not an IAM product.

## Database

[docs/database.md](./docs/database.md) has the full schema. The decisions that matter:
- **One Postgres schema per module** (`finances`, `iam`), matching the module boundaries.
- **No cross-schema foreign key.** `transactions.creator_id` refers to a user
  in `iam`, but it is a plain `uuid` column. In a modular monolith, it is recommended that each module
  owns its data, so the finances module stores the id from the JWT and never
  queries `iam`. The cost is that the database does not guarantee the user
  exists. But this is checked in the application, where a valid token already implies the user.
- **Integrity in the database, not only the API.** I added `CHECK` constraints
  for positive amounts, the currency pattern and the reference format, a native
  enum for the status, `UNIQUE` on the reference, and `ON DELETE RESTRICT` so a
  customer with transactions cannot be deleted.
- **Money is a `bigint` of minor units**, not a float or a `numeric` string. This allows us to avoid unsafe database
  arithmetics with floating-point values.
- **UUIDv7 primary keys**, generated in the application with `node:crypto`.
  I did not use auto-incremented ids because they allow data enumeration: with
  ids `1`, `2`, `3`, anyone can walk `/transactions/{id}` and probe for records,
  and the highest id reveals how many transactions exist. A UUID cannot be
  enumerated or guessed from a neighboring one. I picked v7 over v4 because
  it is also roughly time-ordered, which keeps index inserts local instead of
  scattering them across the index.
- **Indexes** match the access paths: `(status, created_at)` and
  `(customer_id, created_at)` for filters with the default sort, `(created_at)`
  for the unfiltered list, and `pg_trgm` GIN indexes on `reference` and
  `customers.name` for the substring search.

## Frontend

### Stack and structure

I built the dashboard as a client-side SPA with React 19 on Vite.
- **TanStack Router** (file-based): the URL is the source of truth for the list
  state. `page`, `page_size`, `search`, `status`, `customer_id`, `sort_by` and
  `order` are validated search params. A `beforeLoad` guard on the `_authed`
  layout redirects to `/login`, and the redirect target is restricted to same-origin paths.
- **TanStack Query** owns all server state: caching, request cancellation, and
  `keepPreviousData` so paging does not flash the skeleton.
- **TanStack Table** runs in manual mode and renders into shadcn/ui table primitives.
- **TanStack Form + zod** drive the login and create forms, with per-field
  validation that mirrors the backend and maps `422` field errors back onto the fields.

### API layer (a small RQM subset)

For the API layer I reused a small subset of the RQM architecture I designed in earlier projects, and explained during
my interview. `frontend/src/api` separates four concerns so UI code never touches wire formats:

| Folder       | Role                                                                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transport/` | The only place that talks to the server. It attaches the login token, builds the query string, turns server error responses into one error type, and handles a rejected login.                                |
| `resources/` | Describes the data exactly as it travels over the network, with what the app sends and what it receives kept as separate shapes.                                                                              |
| `queries/`   | Describes each read and write the app can do, with a stable name for each cached result. It hands the models to the screens instead of the raw network data.                                                  |
| `models/`    | Wraps a received resource into a friendlier object for the screens: it converts dates, formats amounts as money, and answers questions such as "is this transaction final?" or "can it move to this status?". |

Components receive models, so a wire change is absorbed in one place.

## Trade-offs and assumptions

- **`LIMIT/OFFSET` over cursor pagination.** The dashboard is a data table: it
  needs page numbers, jumping to any page, and a total, and cursor pagination
  cannot offer those, so I did not use it. The list query is a plain
  `LIMIT/OFFSET` with the customer join in the same statement; it does not use
  a deferred join. The cost of a deep page grows with the offset, which does not
  matter at this scale. For a large application I would keep `LIMIT/OFFSET`
  and switch to a **deferred join**.
- **Client-generated reference.** The assessment brief makes the reference a required,
  unique input, so my form pre-fills a generated value that the user may edit.
  The server never generates one; it validates the format and returns `409` on a
  duplicate.
- **Amount ceiling.** The create schema accepts amounts up to `2³² − 1` minor
  units (for example USD 42.9 million, XAF 4.29 billion), although the column is a
  `bigint`. This keeps values safely inside JavaScript's integer range and is easy to raise.
- **Token in `localStorage`.** It survives reloads and keeps the SPA simple,
  but any script on the page can read it. An `HttpOnly` cookie would be safer
  and would add CSRF handling. I kept it simple for this assessment.
- **No customer management.** Customers are created implicitly when a
  transaction is created with a `customer_name`, and two customers may share a
  name. I chose not to match by name, because it would silently merge different people.
- **Deliberately not built:** rate limiting, idempotency keys, refresh tokens,
  roles, an audit trail of status changes, soft deletes and a frontend
  end-to-end suite. Each is a reasonable next step, but I left them out to keep
  the project within the scope of the assessment.

## Testing

| Layer         | What is covered                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Backend unit  | Status state machine (every allowed and forbidden transition), money validation, password hashing, login service                  |
| Backend e2e   | Auth required; create, then approve once and reject the second decision (`409`); duplicate reference; per-field validation errors |
| Frontend unit | Decimal-to-minor-unit conversion and formatting, reference generation, `TransactionModel`                                         |

Since the assessment does not ask for broad coverage, I wrote tests for the rules that are easy to get wrong and expensive to regress.
