/**
 * ثابت‌ها و ابزارهای احراز هویت — بدون وابستگی به `next/headers`.
 * این فایل هم در middleware (Edge)، هم در سرور و هم در باندل کلاینت امن است؛
 * منطق وابسته به درخواست سرور در `src/lib/session.ts` و `src/lib/auth-actions.ts` است.
 */

/** کوکی توکن دسترسی (کوتاه‌عمر، در هر درخواست به API ارسال می‌شود) */
export const ACCESS_TOKEN_COOKIE = "bo_access";

/** کوکی توکن نوسازی (بلندعمر، فقط برای گرفتن جفت توکن تازه) */
export const REFRESH_TOKEN_COOKIE = "bo_refresh";

/** عمر پیش‌فرض کوکی access وقتی بک‌اند `expiresIn` نده (ثانیه) */
export const ACCESS_TOKEN_FALLBACK_TTL = 15 * 60;

/** عمر کوکی refresh (ثانیه) — ۳۰ روز */
export const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60;

/** تنظیمات مشترک کوکی‌های سشن (httpOnly + SameSite=Lax) */
export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/**
 * انقضای یک JWT را بدون اعتبارسنجی امضا می‌خواند.
 * فقط برای تصمیم «آیا وقت نوسازی رسیده؟» — اعتبار واقعی را بک‌اند چک می‌کند.
 * در صورت نامعتبر بودن ساختار، توکن را منقضی در نظر می‌گیریم.
 */
export function isTokenExpired(token: string | undefined, skewSeconds = 30): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return Date.now() >= (payload.exp - skewSeconds) * 1000;
}

type JwtPayload = { exp?: number; [key: string]: unknown };

function decodeJwtPayload(token: string): JwtPayload | null {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
