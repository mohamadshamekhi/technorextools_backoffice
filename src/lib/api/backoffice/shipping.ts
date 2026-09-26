import { api } from "../http";

/** روش‌های ارسال — docs/api/backoffice.md § Shipping Methods. Perm: `shipping.manage`. */

/** فقط این دو مقدار واقعی است — ارسال رایگان با `cost: 0` روی flat مدل می‌شود، نه یک enum جدا */
export type ShippingCostType = "flat" | "by_weight";

export type ShippingMethod = {
  id: string;
  title: string;
  costType: ShippingCostType;
  cost: number;
  freeOverAmount: number | null;
  isActive: boolean;
  sortOrder: number;
};

export type CreateShippingMethodInput = {
  title: string;
  costType: ShippingCostType;
  cost: number;
  freeOverAmount?: number | null;
  isActive?: boolean;
  sortOrder?: number;
};
export type UpdateShippingMethodInput = Partial<CreateShippingMethodInput>;

/** GET /backoffice/shipping-methods */
export const list = () =>
  api.get<ShippingMethod[]>("/backoffice/shipping-methods");

/** POST /backoffice/shipping-methods */
export const create = (input: CreateShippingMethodInput) =>
  api.post<ShippingMethod>("/backoffice/shipping-methods", input);

/** PATCH /backoffice/shipping-methods/{id} */
export const update = (id: string, input: UpdateShippingMethodInput) =>
  api.patch<ShippingMethod>(`/backoffice/shipping-methods/${id}`, input);

/** DELETE /backoffice/shipping-methods/{id} */
export const remove = (id: string) =>
  api.delete<void>(`/backoffice/shipping-methods/${id}`);
