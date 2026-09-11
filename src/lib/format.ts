/**
 * فرمت‌کننده‌های نمایشی فارسی. خروجی همه با ارقام فارسی است؛
 * برای ورودی‌هایی که به regex/API می‌روند از ارقام لاتین استفاده کنید (فرمت نکنید).
 */

const FA = "fa-IR";

/** عدد ساده با جداکننده هزارگان: ۱۲٬۵۰۰ */
export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(FA).format(value);
}

/** قیمت به تومان: ۱۲٬۵۰۰٬۰۰۰ تومان */
export function formatToman(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${new Intl.NumberFormat(FA).format(value)} تومان`;
}

/** تاریخ کوتاه شمسی: ۱۴۰۵/۰۶/۱۹ */
export function formatDate(input: string | number | Date | null | undefined): string {
  const date = toDate(input);
  if (!date) return "—";
  return new Intl.DateTimeFormat(FA, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** تاریخ و ساعت شمسی */
export function formatDateTime(
  input: string | number | Date | null | undefined,
): string {
  const date = toDate(input);
  if (!date) return "—";
  return new Intl.DateTimeFormat(FA, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** حجم فایل خوانا: ۲٫۴ مگابایت / ۸۵۰ کیلوبایت */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || Number.isNaN(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${formatNumber(bytes)} بایت`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${new Intl.NumberFormat(FA, { maximumFractionDigits: 1 }).format(kb)} کیلوبایت`;
  const mb = kb / 1024;
  return `${new Intl.NumberFormat(FA, { maximumFractionDigits: 1 }).format(mb)} مگابایت`;
}

/** تبدیل ارقام لاتین یک رشته به فارسی (بدون تغییر بقیه کاراکترها) */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function toDate(input: string | number | Date | null | undefined): Date | null {
  if (input == null || input === "") return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}
