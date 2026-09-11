import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";

/** انبار و موجودی — docs/api/backoffice.md § Inventory. Perm: `inventory.manage`. */

export type PriceTier = {
  minQty: number;
  unitPrice: number;
};

export type InventoryVariant = {
  id: string;
  sku: string;
  colorName: string | null;
  productId: string;
  productTitle: string;
  stockQty: number;
  priceOverride: number | null;
  weightGrams: number | null;
  basePrice: number;
  priceTiers: PriceTier[];
  isActive: boolean;
};

export type ListInventoryQuery = ListQuery & {
  productId?: string;
  search?: string;
  lowStock?: boolean;
};

export type UpdateInventoryVariantInput = {
  stockQty?: number;
  priceOverride?: number | null;
  weightGrams?: number | null;
  isActive?: boolean;
};

/** GET /backoffice/inventory/variants */
export const list = (query: ListInventoryQuery = {}) =>
  api.get<Paginated<InventoryVariant>>("/backoffice/inventory/variants", {
    query,
  });

/** PATCH /backoffice/inventory/variants/{id} */
export const update = (id: string, input: UpdateInventoryVariantInput) =>
  api.patch<InventoryVariant>(`/backoffice/inventory/variants/${id}`, input);

/** PUT /backoffice/inventory/variants/{id}/price-tiers */
export const replacePriceTiers = (id: string, tiers: PriceTier[]) =>
  api.put<InventoryVariant>(
    `/backoffice/inventory/variants/${id}/price-tiers`,
    { tiers },
  );
