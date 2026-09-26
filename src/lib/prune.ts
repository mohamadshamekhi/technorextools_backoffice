/**
 * حذف کلیدهایی که مقدارشان `null` یا `undefined` است.
 *
 * چند schemaی ساخت در بک‌اند فیلدهای اختیاری را `.optional()` (نه `.nullable()`)
 * تعریف کرده‌اند؛ ارسال `null` برای آن‌ها خطای «اعتبارسنجی ورودی ناموفق بود» می‌دهد.
 * فرم‌های پنل مقدار خالی را `null` می‌فرستند، پس بدنه‌ی درخواست‌های *ساخت* را از این
 * تابع رد می‌کنیم تا فیلد خالی کلاً حذف شود. (برای *ویرایش* `null` معنادار است —
 * یعنی «پاک کن» — و آن‌جا این کار انجام نمی‌شود.)
 */
export function pruneNullish<T extends Record<string, unknown>>(input: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== null && value !== undefined) {
      out[key as keyof T] = value as T[keyof T];
    }
  }
  return out;
}
