/** کلیدهای خطای فیلدیِ پکیج — ماژول خالص (نه سرور اکشن) تا فرم کلاینتی هم بتواند import کند. */

/** کلید خطای فیلدیِ یک ردیف پکیج؛ فرم با همین کلید ردیف را هایلایت می‌کند */
export function variantFieldKey(variantId: string): string {
  return `variant:${variantId}`;
}
