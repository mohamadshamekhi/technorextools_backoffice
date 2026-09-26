/**
 * وضعیت‌های سفارش — تایپ و برچسب‌های فارسی.
 * فایل خالص (بدون وابستگی به http) تا در کامپوننت‌های کلاینت هم قابل import باشد.
 * enum واقعی بک‌اند (Prisma) — نه حدسی؛ حتماً همین مقادیر دقیق فرستاده شود.
 */

export const ORDER_STATUSES = [
  "pending_payment",
  "payment_failed",
  "abandoned",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "در انتظار پرداخت",
  payment_failed: "پرداخت ناموفق",
  abandoned: "رهاشده",
  paid: "پرداخت‌شده",
  processing: "در حال آماده‌سازی",
  shipped: "ارسال‌شده",
  delivered: "تحویل‌شده",
  cancelled: "لغوشده",
};

/** روش پرداخت سفارش — نقدی (تسویه حضوری) در برابر آنلاین (درگاه). */
export const ORDER_PAYMENT_METHODS = ["online", "cash"] as const;

export type OrderPaymentMethod = (typeof ORDER_PAYMENT_METHODS)[number];

export const ORDER_PAYMENT_METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  online: "آنلاین",
  cash: "نقدی",
};
