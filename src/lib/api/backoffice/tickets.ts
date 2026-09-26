import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";
import type { TicketStatus } from "./moderation";

/** تیکت‌های پشتیبانی — docs/api/backoffice.md § Tickets. Perm: `tickets.handle`. */

/** پیوست یک پیام/درخواست — زیرمجموعه‌ی `MediaView`. */
export type MediaAttachment = {
  id: string;
  url: string;
  contentType: string;
  originalName: string | null;
  kind: "IMAGE" | "MODEL" | "DOCUMENT" | "OTHER";
};

export type TicketMessage = {
  id: string;
  body: string;
  authorType: "customer" | "staff";
  authorName: string | null;
  attachments: MediaAttachment[];
  createdAt: string;
};

export type BackofficeTicket = {
  id: string;
  subject: string;
  status: TicketStatus;
  customer: { id: string; fullName: string | null; mobile: string };
  lastMessageAt: string;
  createdAt: string;
};

export type TicketDetail = BackofficeTicket & {
  messages: TicketMessage[];
};

/** GET /backoffice/tickets */
export const list = (query: ListQuery = {}) =>
  api.get<Paginated<BackofficeTicket>>("/backoffice/tickets", { query });

/** GET /backoffice/tickets/{id} */
export const get = (id: string) =>
  api.get<TicketDetail>(`/backoffice/tickets/${id}`);

/**
 * POST /backoffice/tickets/{id}/messages
 * `mediaIds` شناسه‌ی فایل‌هایی است که قبلاً روی `POST /backoffice/media/upload`
 * (بدون `ownerType`) آپلود شده‌اند — حداکثر ۵ تا.
 */
export const reply = (id: string, body: string, mediaIds: string[] = []) =>
  api.post<TicketDetail>(`/backoffice/tickets/${id}/messages`, {
    body,
    mediaIds,
  });

/** PATCH /backoffice/tickets/{id}/status */
export const setStatus = (id: string, status: TicketStatus) =>
  api.patch<TicketDetail>(`/backoffice/tickets/${id}/status`, { status });
