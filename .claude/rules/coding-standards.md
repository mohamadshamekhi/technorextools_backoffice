# Coding standards

Stack: Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · lucide-react.
The dependency set is deliberately minimal — **do not add a package without asking.** No Zod, no `cn()`/`clsx`, no CSS Modules — don't reach for any of these without asking first.

## Before adding a new file or folder

Extract the pattern from the nearest existing sibling (same domain, e.g. another `(dashboard)/<x>/` folder) — naming, file split (`page.tsx`/`actions.ts`/`<domain>-form.tsx`), import style, state approach — and continue that exactly. Adding a new dashboard feature follows the fixed recipe in `architecture.md` → "Adding a dashboard page". Don't introduce a different structure/pattern without an explicit architectural reason, stated in your response.

## Components

- **Server Components by default.** Add `"use client"` only when the file needs `useState`/`useEffect`/`useRef`, browser APIs, or DOM event handlers. Keep the directive at the leaves; a page or layout should rarely be a client component.
- When a client island needs server data, pass it as props from a Server Component rather than fetching on the client.
- Co-locate a route's single-use components inside that route folder. Promote to `src/components/` only on the second consumer.
- Build from the existing primitives in `src/components/ui/` (`PageHeader`, `Card`, `EmptyState`) before writing new layout markup.
- Every route folder that does async work should have `loading.tsx`; every route that can fail should have `error.tsx` (client component). Use `not-found.tsx` for 404 states.

## TypeScript

- `strict` is on. No `any`, no non-null `!` to silence the compiler, no `@ts-ignore` (use `@ts-expect-error` with a reason if truly unavoidable).
- Let inference work; annotate function parameters, return types of exported functions, and exported constants.
- Use `type` aliases for props and data shapes (matches `NavItem` in `src/lib/navigation.ts`).
- Import via the `@/*` alias. No `../../..` chains.
- Discriminated unions over boolean flags for multi-state UI (see the `Step` union in `src/app/login/page.tsx`).

## Data & state

- Fetch in Server Components, route handlers, or server actions once a backend exists — never in `useEffect`.
- Keep each shared constant in exactly one module and import it: sidebar items → `src/lib/navigation.ts`, session cookie name → `src/lib/auth.ts`. Add new shared constants the same way under `src/lib/`.
- Client state stays local (`useState`) unless genuinely cross-cutting. Do not introduce a state-management library without discussion.

## Styling

- Tailwind utilities only. Use theme tokens — `bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `border-primary`, `text-primary-foreground`. **No hard-coded hex/rgb in components.**
- New colors: add a `--var` in `:root` and a matching `--color-*` under `@theme inline` in `src/app/globals.css`, then use the generated utility.
- Directional layout must be RTL-safe — prefer logical utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`); see `rtl-persian.md`.
- Conditional classes: inline template literals, as in the current code. No `clsx`/`cn` helper exists — don't add one without asking.

## Accessibility

- Interactive elements are real `<button>`/`<a>`; add `aria-label` when the control is icon-only (see the menu button in `dashboard-shell.tsx`).
- Every input has an associated `<label>` (`htmlFor`) or `aria-label`.
- Preserve visible focus styles; don't remove outlines without a replacement.
- Modal/drawer overlays trap nothing today — if you extend the mobile drawer, add `Escape`-to-close and focus handling.

## Naming & files

- Files: kebab-case (`dashboard-shell.tsx`). Components: PascalCase. Hooks: `useThing`. Event handlers: `handleThing`.
- One primary export per component file, named (not default) for shared components; route files use the framework's default export.

## Quality gate

- `npm run lint` passes with no new warnings.
- No `console.log` left in committed code (`console.error` in an `error.tsx` boundary is fine).
- No dead code, commented-out blocks, or unused imports.
