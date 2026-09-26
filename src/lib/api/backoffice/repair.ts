import type { BadgeTone } from "@/components/ui/badge";
import type { RepairStatus } from "./moderation";

/**
 * تایپ‌ها و کمک‌تابع‌های خالص تعمیرات — بدون وابستگی به `http.ts`، تا کامپوننت‌های
 * کلاینت (مودال جزئیات) بتوانند مستقیم import کنند بدون کشاندن `next/headers` به باندل.
 */

/** پیوست درخواست تعمیر — بک‌اند این‌جا `kind` نمی‌دهد، نوع از `contentType` تشخیص داده می‌شود */
export type RepairAttachment = {
  id: string;
  url: string;
  contentType: string;
  originalName: string | null;
};

/** شکل قطعی آیتم لیست تعمیرات (docs/api/backoffice.md § Repairs) */
export type RepairRequest = {
  id: string;
  issueDescription: string;
  status: RepairStatus;
  /** لیبل فارسی آماده‌ی بک‌اند — مبنای نمایش وضعیت */
  statusLabel: string;
  user: { name: string | null; mobile: string | null } | null;
  warranty: { serialNumber: string | null; orderId: string | null } | null;
  attachments: RepairAttachment[];
  /** یافته‌های تکنسین — با `PATCH /backoffice/repairs/{id}` ثبت می‌شود */
  technicianNote?: string | null;
  estimatedCost?: number | null;
  createdAt: string;
  updatedAt: string | null;
};

export type UpdateRepairInput = {
  technicianNote?: string;
  estimatedCost?: number;
};

/** تصویر بودن پیوست از روی `contentType` */
export function isImageAttachment(attachment: RepairAttachment): boolean {
  return attachment.contentType.startsWith("image/");
}


/** رنگ بج هر وضعیت تعمیر */
export const REPAIR_STATUS_TONE: Record<RepairStatus, BadgeTone> = {
  received: "warning",
  reviewing: "info",
  awaiting_customer: "warning",
  awaiting_parts: "warning",
  in_progress: "info",
  done: "success",
  delivered: "success",
  canceled: "danger",
};
