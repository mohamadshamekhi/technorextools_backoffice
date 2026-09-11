import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";

/** کدهای تخفیف — docs/api/backoffice.md § Discounts. Perm: `discounts.view` / `discounts.manage`. */

export type DiscountKind = "single_product" | "multi_product" | "user_specific";
export type DiscountAmountType = "percent" | "fixed";
export type DiscountTargetType = "product" | "category" | "user";
export type DiscountTarget = { targetType: DiscountTargetType; targetId: string };

export type BackofficeDiscount = {
  id: string;
  code: string;
  kind: DiscountKind;
  amountType: DiscountAmountType;
  value: number;
  maxUsageTotal: number | null;
  maxUsagePerUser: number | null;
  minOrderAmount: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  targets: DiscountTarget[];
  usageCount: number;
  createdAt: string;
};

export type DiscountUsage = {
  id: string;
  userId: string;
  userName: string | null;
  orderNumber: string;
  amount: number;
  usedAt: string;
};

export type CreateDiscountInput = {
  code: string;
  kind: DiscountKind;
  amountType: DiscountAmountType;
  value: number;
  maxUsageTotal?: number | null;
  maxUsagePerUser?: number | null;
  minOrderAmount?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
  targets?: DiscountTarget[];
};
export type UpdateDiscountInput = Partial<CreateDiscountInput>;

/** GET /backoffice/discounts */
export const list = (query: ListQuery = {}) =>
  api.get<Paginated<BackofficeDiscount>>("/backoffice/discounts", { query });

/** GET /backoffice/discounts/{id} */
export const get = (id: string) =>
  api.get<BackofficeDiscount>(`/backoffice/discounts/${id}`);

/** GET /backoffice/discounts/{id}/usages */
export const usages = (id: string) =>
  api.get<DiscountUsage[]>(`/backoffice/discounts/${id}/usages`);

/** POST /backoffice/discounts */
export const create = (input: CreateDiscountInput) =>
  api.post<BackofficeDiscount>("/backoffice/discounts", input);

/** PATCH /backoffice/discounts/{id} */
export const update = (id: string, input: UpdateDiscountInput) =>
  api.patch<BackofficeDiscount>(`/backoffice/discounts/${id}`, input);

/** DELETE /backoffice/discounts/{id} */
export const remove = (id: string) =>
  api.delete<void>(`/backoffice/discounts/${id}`);
