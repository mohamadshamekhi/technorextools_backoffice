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

export const REPAIR_STATUSES = ["received", "in_progress", "done"] as const;
export type RepairStatus = (typeof REPAIR_STATUSES)[number];
export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  received: "دریافت‌شده",
  in_progress: "در حال تعمیر",
  done: "آماده تحویل",
};
