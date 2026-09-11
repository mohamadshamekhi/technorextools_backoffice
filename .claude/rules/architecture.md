# Architecture

Backoffice admin panel. Everything below is the current, real shape of the code — keep it accurate as the app grows.

## Rendering & routing

- Next.js App Router. Two top-level areas under `src/app/`:
  - **`login/`** — standalone, no shell. The only public route.
  - **`(dashboard)/`** — a route group (parentheses = no URL segment). Its `layout.tsx` wraps every child in `DashboardShell`, so all authed pages get the sidebar + header for free.
- `src/app/layout.tsx` is the root: sets `lang="fa" dir="rtl"`, imports `globals.css`, defines the title template (`"%s | پنل مدیریت"`).
- Auth is enforced once, at the edge, in `src/proxy.ts` (با نوسازی خودکار توکن) — not per page. See `auth.md`.

## Composition model

```
RootLayout (RTL, fonts, metadata)
 ├─ /login            → LoginPage (client, self-contained)
 └─ (dashboard)/layout → DashboardShell (client: mobile drawer state, logout)
     ├─ SidebarContent  ← navItems from src/lib/navigation.ts
     ├─ <header>        ← menu toggle + logout
     └─ <main>{page}</main>
          └─ each page composes ui/ primitives (PageHeader, Card, EmptyState)
```

- `DashboardShell` is a client component because it owns the mobile-drawer `useState` and the logout handler. Pages rendered inside it are still Server Components unless they opt in. `navItems` carries a `section` field; the sidebar groups items under section headings.
- Every backoffice API domain now has a section: `users`, `products`, `orders`, `settings`, `reports`, `brands`, `categories` (+ attribute groups), `discounts`, `bundles`, `articles`, `branches`, `seo`, `comments`, `tickets`, `warranties`, `repairs`, `shipping`, `inventory`, `loyalty`, `roles`, `payments`. Shared pattern: list `page.tsx` (Server Component) + `loading.tsx`, `new/page.tsx` and `[id]/page.tsx` for CRUD, a co-located `<domain>-form.tsx` (client) shared by new/edit, and `actions.ts` server actions with `revalidatePath`. Reusable primitives: `ui/link-button`, `ui/delete-button`, `ui/form-controls` (`TextArea`), `ui/image-uploader`.
- **آپلود تصویر:** هر جا فرم از کاربر تصویر می‌گیرد (لوگوی برند، کاور مقاله، تصویر OG) به‌جای فیلد URL از `<ImageUploader>` استفاده می‌شود — فایل را با `uploadImageAction` (`src/lib/media-actions.ts`) به `POST /backoffice/media/upload` می‌فرستد و `url` عمومی برگشتی در فیلد فرم ذخیره می‌شود. کلاینت HTTP (`api/http.ts`) اگر `body` از نوع `FormData` باشد آن را چندبخشی می‌فرستد. ماژول `mediaApi` در `api/backoffice/media.ts`. `parentId`/فیلدهای اختیاری `null` در بدنه‌ی *ساخت* با `pruneNullish` (`src/lib/prune.ts`) حذف می‌شوند.

## Single sources of truth

| Concern | Owner module |
|---|---|
| Sidebar / navigation | `src/lib/navigation.ts` (`navItems`) |
| Session cookie names + options | `src/lib/auth.ts` (`ACCESS_TOKEN_COOKIE`, `REFRESH_TOKEN_COOKIE`) |
| Theme colors | `src/app/globals.css` (`:root` vars + `@theme inline`) |
| Shared UI primitives | `src/components/ui/` |

Add new cross-cutting constants under `src/lib/`, one concern per file.

## Theming system

- `:root` holds raw values as `--background`, `--surface`, `--foreground`, `--muted`, `--border`, `--primary`, `--primary-foreground`.
- `@theme inline` maps each to a `--color-*` so Tailwind generates `bg-surface`, `text-muted`, etc.
- A global `* { border-color: var(--border) }` means a bare `border` utility is already themed.
- No dark mode yet. To add it: duplicate the `:root` block under a `.dark` selector (or `@media (prefers-color-scheme: dark)`), keep the same variable names.

## Adding a dashboard page

1. `src/app/(dashboard)/<name>/page.tsx` — default export, Server Component, start from `PageHeader` + `EmptyState`.
2. Add `{ title, href: "/<name>", icon }` to `navItems` in `src/lib/navigation.ts`; `href` must equal the folder path.
3. Add `loading.tsx` / `error.tsx` in the folder if the page does async work.

## Backend

وصل است. کلاینت تایپ‌دار سمت سرور در `src/lib/api/` (جزئیات `api.md` و `src/lib/api/README.md`):

- `http.ts` — fetch wrapper، توکن از کوکی `bo_access`، `ApiError`، `Paginated<T>`.
- `backoffice/<domain>.ts` — یک ماژول به‌ازای هر دامنه (`users`, `products`, `orders`, `settings`, `reports`).
- صفحات لیستی: Server Component، `searchParams` → `parsePageParams` (`src/lib/pagination.ts`) → `api.list(...)`، جدول با `ui/data-table` + `ui/pagination`.
- تغییر داده: سرور اکشن‌های هم‌محل با صفحه (`app/(dashboard)/<x>/actions.ts`) + `revalidatePath`؛ فرم‌ها Client Component با `useTransition` و `ui/form-controls`.
- **خطاهای دسترسی در صفحات:** fetch را در `guarded(...)` (لیست) یا `guardedResource(...)` (جزئیات، `404`→`notFound`) از `@/lib/api` بپیچید. این‌ها `401`→`redirect('/login')` و `403`→`forbidden()` (نمایش `(dashboard)/forbidden.tsx`) می‌کنند. نیازمند `experimental.authInterrupts` در `next.config.ts`. در سرور اکشن‌ها به‌جای این‌ها `ApiError.displayMessage` را در فرم نشان دهید.
- احراز هویت و نوسازی توکن: `auth.md`.
