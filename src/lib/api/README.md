# src/lib/api

کلاینت API بک‌اند. **فقط سمت سرور** (Server Component / route handler / server action) —
توکن نباید به کلاینت برسد. هرگز از یک Client Component از این پوشه import نکنید
(به‌جز `import type` خالص، یا فایل‌های خالص مثل `backoffice/order-status.ts`).

## ساختار

| مسیر | نقش |
|---|---|
| `http.ts` | fetch wrapper: base URL از `API_BASE_URL`، هدر `Bearer` از کوکی `bo_access`، مدیریت JSON، `ApiError` (با `displayMessage`/`isUnauthorized`/…)، تایپ `Paginated<T>` |
| `auth.ts` | بخش Auth (`docs/api/auth.md`) — otp/verify/refresh با `auth: false` |
| `backoffice/common.ts` | تایپ‌های مشترک (`ListQuery`) |
| `backoffice/<domain>.ts` | یک ماژول به‌ازای هر دامنه: `users`, `products`, `orders`, `settings`, `reports`, `brands`, `categories`, `discounts`, `bundles`, `content` (articles/branches/seo)، `comments`, `tickets`, `warranties` (+repairs)، `shipping`, `inventory`, `loyalty`, `access` (roles)، `payments`، `media` (آپلود چندبخشی) |
| `backoffice/order-status.ts` · `backoffice/moderation.ts` | تایپ/برچسب وضعیت‌ها — فایل خالص، قابل import در کلاینت |
| `index.ts` | barrel: `export * as <name>Api` |

## افزودن دامنه‌ی جدید از docs/api/backoffice.md

1. بخش مربوطه را در `docs/api/backoffice.md` باز کن (مسیرها، body، permission).
2. `src/lib/api/backoffice/<domain>.ts` بساز: به‌ازای هر endpoint یک تابع نازک روی `api`،
   با تایپ صریح ورودی/خروجی. شکل پاسخ‌های نامشخص را با کامنت فارسی علامت بزن.
3. در `index.ts` اضافه کن: `export * as <domain>Api from "./backoffice/<domain>";`

## مصرف

```ts
import { usersApi, ApiError } from "@/lib/api";

const { items, total } = await usersApi.list({ skip: 0, take: 20, search });
```

- خطاها: `catch` روی `ApiError` (دارای `status`، `body.errors`، و `displayMessage` فارسی).
- لیست‌ها: `Paginated<T>` = `{ items, total, skip, take }`.
- کش: پیش‌فرض `no-store`؛ برای داده‌ی کم‌تغییر `{ revalidate: <ثانیه> }` بده.
- تغییر داده در سرور اکشن‌های صفحه (`app/(dashboard)/<x>/actions.ts`) + `revalidatePath`.
