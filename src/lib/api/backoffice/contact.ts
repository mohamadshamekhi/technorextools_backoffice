import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";
import type { ContactMessageStatus } from "./moderation";

/** پیام‌های فرم تماس با ما — Perm: `contact.view`. */

export type ContactMessage = {
  id: string;
  name: string;
  phone: string;
  subject: string | null;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
};

export type ListContactMessagesQuery = ListQuery & {
  status?: ContactMessageStatus;
};

/** GET /backoffice/contact-messages */
export const list = (query: ListContactMessagesQuery = {}) =>
  api.get<Paginated<ContactMessage>>("/backoffice/contact-messages", { query });

/** PATCH /backoffice/contact-messages/{id} */
export const setStatus = (id: string, status: ContactMessageStatus) =>
  api.patch<{ id: string; status: ContactMessageStatus }>(
    `/backoffice/contact-messages/${id}`,
    { status },
  );
