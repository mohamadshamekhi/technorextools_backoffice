# Backend API

The backend is an external service. Its full contract is a Postman collection at
`../api/postman/abzar-api.postman_collection.json` (~137 KB / 138 endpoints) — **do not read that file**; it will blow the context budget.

Instead use the compact generated reference in `docs/api/`:

1. `docs/api/README.md` — base URLs, Postman env variables, auth model.
2. `docs/api/INDEX.md` — every endpoint as `METHOD /path — name`, grouped by section. Read this first to locate an endpoint.
3. `docs/api/<section>.md` (`auth`, `backoffice`, `storefront`, `health`) — per-endpoint detail: description, required permission, auth, query params, request-body JSON. Open only the one section you need.

Only fall back to the raw Postman JSON (grep it, never read whole) if the generated docs are missing a field you need.

## Keeping docs in sync

`docs/api/` is generated and committed. When the Postman collection changes:

```bash
npm run gen:api
```

Then review the diff and commit. Never hand-edit files under `docs/api/`.

## Contract facts

- Base path: `apiBase = http://localhost:4000/api/v1`. All paths in the docs are relative to it.
- Auth: OTP login → `POST /auth/otp/request` then `/auth/otp/verify` returns `accessToken` + `refreshToken`; `POST /auth/refresh` rotates. Backoffice calls send `Authorization: Bearer <accessToken>`.
- Backoffice endpoints are permission-gated — each doc entry notes its `Perm:` (RBAC catalog under `/backoffice/access/permissions`).
- List endpoints paginate with `skip` / `take` (default `take=20`).
- احراز هویت واقعی این endpointها را مصرف می‌کند — `auth.md`.

## Client (`src/lib/api/`)

A typed, server-only client already exists — see `src/lib/api/README.md`.

- `http.ts` provides `api.get/post/patch/put/delete`, `ApiError`, `Paginated<T>`. Base URL from `API_BASE_URL` (`.env.example`), bearer token pulled from the `SESSION_COOKIE`.
- `auth.ts` برای بخش auth؛ بخش پرحجم backoffice به دامنه‌ها تقسیم شده: `backoffice/<domain>.ts`. توابع نازک تایپ‌دار روی `api`. در `index.ts` با `export * as <name>Api` ثبت کن.
- Client Componentها نباید از این پوشه import کنند (به‌جز `import type` یا فایل‌های خالص مثل `backoffice/order-status.ts`) — وگرنه `next/headers` به باندل کلاینت می‌رود.
- Server-only: call from Server Components / route handlers / server actions, never `useEffect`. Never import from a client component.
- Model every request/response shape explicitly; never `any` a payload.
