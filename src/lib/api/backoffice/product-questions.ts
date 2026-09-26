import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";
import type { ProductQuestionStatus } from "./moderation";

/**
 * پرسش‌های محصول — Perm: `product-questions.moderate`.
 * پاسخ‌دادن همان لحظه پرسش را `approved` و عمومی می‌کند؛ برای رد کردن بدون پاسخ
 * از `setStatus` استفاده کنید.
 */

export type ProductQuestion = {
  id: string;
  question: string;
  answer: string | null;
  status: ProductQuestionStatus;
  author: { id: string; fullName: string | null } | null;
  product: { id: string; title: string } | null;
  createdAt: string;
  answeredAt: string | null;
};

export type ListProductQuestionsQuery = ListQuery & {
  /** پیش‌فرض بک‌اند: `pending` */
  status?: ProductQuestionStatus;
};

/** GET /backoffice/product-questions */
export const list = (query: ListProductQuestionsQuery = {}) =>
  api.get<Paginated<ProductQuestion>>("/backoffice/product-questions", {
    query,
  });

/** POST /backoffice/product-questions/{id}/answer — پاسخ = انتشار */
export const answer = (id: string, answer: string) =>
  api.post<{ id: string; status: ProductQuestionStatus; answer: string }>(
    `/backoffice/product-questions/${id}/answer`,
    { answer },
  );

/** PATCH /backoffice/product-questions/{id} — رد کردن بدون پاسخ */
export const setStatus = (id: string, status: ProductQuestionStatus) =>
  api.patch<{ id: string; status: ProductQuestionStatus }>(
    `/backoffice/product-questions/${id}`,
    { status },
  );
