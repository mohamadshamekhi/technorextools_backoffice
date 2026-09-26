/**
 * نوع و زبان اسناد محصول — فایل خالص (بدون وابستگی به http) تا در کامپوننت‌های
 * کلاینت هم قابل import باشد. مقادیر دقیقاً enum بک‌اند است.
 */

export const PRODUCT_DOCUMENT_TYPES = [
  "catalog",
  "manual",
  "datasheet",
  "certificate",
] as const;

export type ProductDocumentType = (typeof PRODUCT_DOCUMENT_TYPES)[number];

export const PRODUCT_DOCUMENT_TYPE_LABELS: Record<ProductDocumentType, string> = {
  catalog: "کاتالوگ",
  manual: "دفترچه راهنما",
  datasheet: "دیتاشیت",
  certificate: "گواهی‌نامه",
};

/** زبان‌های رایج سند؛ مقدار روی بک‌اند رشته‌ی آزاد است */
export const PRODUCT_DOCUMENT_LOCALES = ["fa", "en"] as const;

export const PRODUCT_DOCUMENT_LOCALE_LABELS: Record<string, string> = {
  fa: "فارسی",
  en: "انگلیسی",
};
