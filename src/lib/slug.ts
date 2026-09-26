// اعتبارسنجی و پاک‌سازی اسلاگ، هم‌راستا با قاعده‌ی بک‌اند (فقط حروف لاتین کوچک، عدد و خط‌تیره)
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const SLUG_HINT = "فقط حروف لاتین کوچک، عدد و خط‌تیره";

export const SLUG_INVALID_MESSAGE =
  "اسلاگ فقط می‌تواند شامل حروف لاتین کوچک، عدد و خط‌تیره باشد (مثل: my-product-name).";

// هنگام تایپ، کاراکترهای غیرمجاز (از جمله حروف فارسی) را حذف می‌کند تا کاربر متوجه محدودیت شود
export function sanitizeSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-");
}
