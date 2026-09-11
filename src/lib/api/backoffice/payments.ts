import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";

/** تراکنش‌های پرداخت — docs/api/backoffice.md § Payments. Perm: `payments.view`. */

export type PaymentStatus = "pending" | "success" | "failed";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "در انتظار",
  success: "موفق",
  failed: "ناموفق",
};

export type BackofficePayment = {
  id: string;
  orderNumber: string;
  amount: number;
  status: PaymentStatus;
  gateway: string;
  refId: string | null;
  paidAt: string | null;
  createdAt: string;
};

/** GET /backoffice/payments */
export const list = (query: ListQuery = {}) =>
  api.get<Paginated<BackofficePayment>>("/backoffice/payments", { query });

/**
 * روش‌های پرداخت — docs/api/backoffice.md § Payment Methods. Perm: `payment-methods.manage`.
 * دو ردیف پیش‌فرض seed شده‌اند (`code: "online"` و `code: "cash"`) ولی افزودن روش دلخواه
 * هم مجاز است؛ `code` فقط هنگام ساخت تعیین می‌شود و بعدش تغییرناپذیر است.
 */
export type PaymentMethod = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type CreatePaymentMethodInput = {
  code: string;
  title: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

export type UpdatePaymentMethodInput = {
  title: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
};

/** GET /backoffice/payment-methods */
export const listMethods = () =>
  api.get<PaymentMethod[]>("/backoffice/payment-methods");

/** GET /backoffice/payment-methods/{id} */
export const getMethod = (id: string) =>
  api.get<PaymentMethod>(`/backoffice/payment-methods/${id}`);

/** POST /backoffice/payment-methods */
export const createMethod = (input: CreatePaymentMethodInput) =>
  api.post<PaymentMethod>("/backoffice/payment-methods", input);

/** PATCH /backoffice/payment-methods/{id} — `code` تغییرناپذیر است، در بدنه ارسال نمی‌شود. */
export const updateMethod = (id: string, input: UpdatePaymentMethodInput) =>
  api.patch<PaymentMethod>(`/backoffice/payment-methods/${id}`, input);

/** DELETE /backoffice/payment-methods/{id} */
export const removeMethod = (id: string) =>
  api.delete<void>(`/backoffice/payment-methods/${id}`);
