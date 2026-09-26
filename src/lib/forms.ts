/**
 * ابزار مشترک فرم‌ها: نتیجه‌ی استاندارد سرور اکشن‌ها و استخراج خطاهای فیلدی.
 *
 * این ماژول باید کلاینت‌سالم بماند — `ApiError` را از `@/lib/api` ایمپورت نمی‌کنیم
 * (آن زنجیره `next/headers` را به باندل مرورگر می‌کشد) و فقط ساختارش را تشخیص می‌دهیم.
 */

/** خطاهای اعتبارسنجی به تفکیک فیلد؛ کلید = نام فیلد فرم، مقدار = پیام فارسی */
export type FieldErrors = Record<string, string>;

/** نتیجه‌ی استاندارد سرور اکشن‌ها */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

/** پاسخ خطای فرم بدون فراخوانی بک‌اند (اعتبارسنجی سمت کلاینت) */
export function invalid(
  fieldErrors: FieldErrors,
  message = "لطفاً خطاهای فرم را برطرف کنید.",
): { ok: false; message: string; fieldErrors: FieldErrors } {
  return { ok: false, message, fieldErrors };
}

/** پیام خطای یک فیلد را از نتیجه‌ی اکشن برمی‌گرداند (برای نمایش زیر اینپوت) */
export function fieldError<T = undefined>(
  result: ActionResult<T> | null | undefined,
  field: string,
): string | undefined {
  return result && !result.ok ? result.fieldErrors?.[field] : undefined;
}

/**
 * با تغییر مقدار یک فیلد، خطای همان فیلد را از نتیجه برمی‌دارد؛
 * اگر دیگر خطای فیلدی نمانده باشد کل نتیجه پاک می‌شود (پیام کلی هم نمی‌ماند).
 */
export function clearFieldError<T = undefined>(
  result: ActionResult<T> | null,
  field: string,
): ActionResult<T> | null {
  if (
    !result ||
    result.ok ||
    !result.fieldErrors ||
    !(field in result.fieldErrors)
  ) {
    return result;
  }
  const rest = { ...result.fieldErrors };
  delete rest[field];
  return Object.keys(rest).length ? { ...result, fieldErrors: rest } : null;
}

/** ساخت نتیجه‌ی خطا از یک استثنا؛ خطاهای فیلدیِ بک‌اند (`ApiError.body.errors`) را هم استخراج می‌کند */
export function fail(
  error: unknown,
  fallback: string,
): { ok: false; message: string; fieldErrors?: FieldErrors } {
  // ApiError یک getter به نام displayMessage دارد؛ با `in` روی زنجیره‌ی پروتوتایپ پیدایش می‌کنیم
  if (error instanceof Error && "displayMessage" in error) {
    const apiError = error as Error & {
      displayMessage: string;
      body?: { errors?: Record<string, unknown> };
    };
    const raw = apiError.body?.errors;
    const fieldErrors =
      raw && Object.keys(raw).length
        ? Object.fromEntries(
            Object.entries(raw).map(([key, msgs]) => [
              key,
              Array.isArray(msgs) ? msgs[0] : String(msgs),
            ]),
          )
        : undefined;
    return { ok: false, message: apiError.displayMessage, fieldErrors };
  }
  return { ok: false, message: fallback };
}
