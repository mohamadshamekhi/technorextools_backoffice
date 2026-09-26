/**
 * تایپ‌های مشترک ماژول‌های backoffice.
 * مرجع endpointها: docs/api/backoffice.md
 */

/** پارامترهای صفحه‌بندی استاندارد لیست‌ها (پیش‌فرض take=20) */
export type ListQuery = {
  skip?: number;
  take?: number;
};

/** برچسب فعال/غیرفعال یک موجودیت */
export type ActiveFlag = { isActive: boolean };
