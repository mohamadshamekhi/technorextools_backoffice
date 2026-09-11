import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";
import type { TicketStatus } from "./moderation";

/** تیکت‌های پشتیبانی — docs/api/backoffice.md § Tickets. Perm: `tickets.handle`. */

export type TicketMessage = {
  id: string;
  body: string;
  authorType: "customer" | "staff";
  authorName: string | null;
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

/** POST /backoffice/tickets/{id}/messages */
export const reply = (id: string, body: string) =>
  api.post<TicketDetail>(`/backoffice/tickets/${id}/messages`, { body });

/** PATCH /backoffice/tickets/{id}/status */
export const setStatus = (id: string, status: TicketStatus) =>
  api.patch<TicketDetail>(`/backoffice/tickets/${id}/status`, { status });
