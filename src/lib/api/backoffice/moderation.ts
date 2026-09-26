/** وضعیت‌های نظر و تیکت — فایل خالص، قابل import در کلاینت. enumهای واقعی بک‌اند. */

export const COMMENT_STATUSES = ["pending", "approved", "rejected"] as const;
export type CommentStatus = (typeof COMMENT_STATUSES)[number];
export const COMMENT_STATUS_LABELS: Record<CommentStatus, string> = {
  pending: "در انتظار بررسی",
  approved: "تأییدشده",
  rejected: "ردشده",
};

export const TICKET_STATUSES = ["open", "answered", "closed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "باز",
  answered: "پاسخ داده‌شده",
  closed: "بسته",
};

export const REPAIR_STATUSES = [
  "received",
  "reviewing",
  "awaiting_customer",
  "awaiting_parts",
  "in_progress",
  "done",
  "delivered",
  "canceled",
] as const;
export type RepairStatus = (typeof REPAIR_STATUSES)[number];
/**
 * بک‌اند در هر آیتم `statusLabel` آماده می‌دهد و نمایش وضعیت از همان خوانده می‌شود؛
 * این نگاشت فقط برای جایی است که آیتمی در کار نیست (گزینه‌های فیلتر و دراپ‌دان تغییر وضعیت).
 */
export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  received: "دریافت‌شده",
  reviewing: "در حال بررسی",
  awaiting_customer: "در انتظار مشتری",
  awaiting_parts: "در انتظار قطعه",
  in_progress: "در حال تعمیر",
  done: "آماده تحویل",
  delivered: "تحویل شد",
  canceled: "لغو شد",
};

export const PRODUCT_QUESTION_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;
export type ProductQuestionStatus = (typeof PRODUCT_QUESTION_STATUSES)[number];
export const PRODUCT_QUESTION_STATUS_LABELS: Record<ProductQuestionStatus, string> = {
  pending: "در انتظار پاسخ",
  approved: "منتشرشده",
  rejected: "ردشده",
};

export const CONTACT_MESSAGE_STATUSES = ["new", "handled"] as const;
export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];
export const CONTACT_MESSAGE_STATUS_LABELS: Record<ContactMessageStatus, string> = {
  new: "جدید",
  handled: "رسیدگی‌شده",
};
