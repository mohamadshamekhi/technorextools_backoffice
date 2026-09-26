import { cache } from "react";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth";
import { authApi } from "@/lib/api";
import type { SessionUser } from "@/lib/api/auth";

/**
 * لایه‌ی سشن سمت سرور — فقط در Server Component / route handler / server action.
 * نوسازی توکن در `src/proxy.ts` انجام می‌شود؛ اینجا فقط خواندن است.
 */

/** توکن دسترسی از کوکی (اگر نبود null) */
export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function hasSession(): Promise<boolean> {
  const store = await cookies();
  return Boolean(
    store.get(ACCESS_TOKEN_COOKIE)?.value ?? store.get(REFRESH_TOKEN_COOKIE)?.value,
  );
}

/**
 * کاربر جاری (GET /auth/me) — در طول یک درخواست کش می‌شود، پس
 * می‌توان از چند کامپوننت بدون فراخوانی تکراری صدا زد.
 * اگر توکن نامعتبر باشد خطا پرتاب می‌شود (به error boundary یا لاگین می‌رسد).
 */
export const getCurrentUser = cache(async (): Promise<SessionUser> => {
  return authApi.getCurrentUser();
});
