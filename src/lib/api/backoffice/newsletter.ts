import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";

/** مشترکین خبرنامه — Perm: `newsletter.view`. فقط خواندنی در پنل. */

export type NewsletterSubscriber = {
  id: string;
  /** ایمیل یا موبایل مشترک */
  contact: string;
  isActive: boolean;
  createdAt: string;
};

export type ListNewsletterQuery = ListQuery & {
  isActive?: boolean;
};

/** GET /backoffice/newsletter */
export const list = (query: ListNewsletterQuery = {}) =>
  api.get<Paginated<NewsletterSubscriber>>("/backoffice/newsletter", { query });
