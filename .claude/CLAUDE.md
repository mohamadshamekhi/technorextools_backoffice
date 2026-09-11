# Project guidance

**Backoffice** — Persian, RTL admin panel. Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · lucide-react. Import alias `@/*` → `src/*`.

## Commands

| | |
|---|---|
| `npm run dev` | dev server → http://localhost:3000 |
| `npm run build` | production build |
| `npm run start` | serve the production build |
| `npm run lint` | ESLint (`eslint-config-next`) — must pass clean |

No test runner is configured.

## Operating mode

Work per `.claude/rules/token-economy.md` at all times: read only what the task needs, batch tool calls, no preamble or narration, no unsolicited refactors, don't build just to check types.

## Rule files — load on demand

Read a file below **only when the task enters its domain.** Do not bulk-load them.

| Load when the task involves… | File |
|---|---|
| any code change (components, TS, styling, a11y, naming) | `.claude/rules/coding-standards.md` |
| UI copy, layout, spacing, direction, fonts, numerals | `.claude/rules/rtl-persian.md` |
| login, OTP, session cookie, middleware, logout | `.claude/rules/auth.md` |
| calling the backend / any endpoint / API client | `.claude/rules/api.md` |
| understanding how the app fits together / adding routes | `.claude/rules/architecture.md` |
| branching, commits, PRs, "is this done?" | `.claude/rules/workflow.md` |
| bug-fixing scope, Definition of Done, design/UX/security checks | `.claude/rules/quality-gates.md` |

## Essential context (always true)

- **Persian + RTL is a hard constraint.** `<html lang="fa" dir="rtl">` in `src/app/layout.tsx`. Every UI string and every code comment is Persian.
- **Auth is wired to the backend.** OTP login → two httpOnly cookies (`bo_access`, `bo_refresh`); `src/proxy.ts` (Next 16 middleware, named `proxy`) checks/refreshes the access token at the edge. Cookies written only in server actions + `proxy.ts`. Details: `auth.md`.
- **Backend API** lives in an external Postman collection. Never read that JSON — use the compact generated `docs/api/` (INDEX + per-section). Typed server-only client in `src/lib/api/` (domain split under `backoffice/`). Details: `api.md`.
- **Route groups.** `src/app/(dashboard)/` pages render inside `DashboardShell` via the group layout; `src/app/login/` renders standalone.
- **Single sources of truth.** Nav → `src/lib/navigation.ts`; cookie names/options → `src/lib/auth.ts`; theme tokens → `src/app/globals.css`; shared UI → `src/components/ui/`; Persian formatters → `src/lib/format.ts`.
- **Theming.** Use generated token utilities (`bg-surface`, `text-muted`, `border-primary`, semantic `bg-success-surface`/`text-danger`/…) — never hard-coded colors. No dark mode.
- **Adding a dashboard page.** Create `src/app/(dashboard)/<name>/page.tsx`, then add a matching `navItems` entry (`href` = folder path). Full recipe (api module → page/actions/form → nav entry): `architecture.md`.
- **Match existing patterns, don't invent new ones.** Before adding a file/folder, extract naming, layering, and state conventions from the nearest existing sibling and follow that exactly — see `coding-standards.md`.
- **`cloud.md`** (repo root) is a living ledger of structural changes — append one line to it in the same turn you make a structural change.
