import { api } from "../http";

/**
 * شمارنده‌های سایدبار — هر ادمین لاگین‌شده. کلیدهایی که کاربر مجوز بخششان را ندارد
 * در پاسخ نمی‌آیند.
 */
export type BadgeCounts = Partial<
  Record<
    | "tickets"
    | "comments"
    | "repairs"
    | "warranties"
    | "productQuestions"
    | "contactMessages"
    | "newsletter",
    number
  >
>;
export type BadgeKey = keyof BadgeCounts;

/** GET /backoffice/badges */
export const counts = () => api.get<BadgeCounts>("/backoffice/badges");

/** POST /backoffice/badges/{section}/seen — صفر کردن شمارنده‌ی بخش‌های بدون وضعیت «رسیدگی‌شده» */
export const markSeen = (section: "newsletter") =>
  api.post<void>(`/backoffice/badges/${section}/seen`);
