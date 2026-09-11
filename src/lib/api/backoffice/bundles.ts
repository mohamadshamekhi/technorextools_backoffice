import { api } from "../http";

/** پکیج‌ها — docs/api/backoffice.md § Bundles. Perm: `bundles.manage`. */

export type BundleItem = {
  variantId: string;
  qty: number;
  title?: string | null;
};

export type BackofficeBundle = {
  id: string;
  title: string;
  slug: string;
  bundlePrice: number;
  isActive: boolean;
  items: BundleItem[];
  createdAt: string;
};

export type CreateBundleInput = {
  title: string;
  slug: string;
  bundlePrice: number;
  isActive?: boolean;
  items: { variantId: string; qty: number }[];
};
export type UpdateBundleInput = Partial<CreateBundleInput>;

/** GET /backoffice/bundles */
export const list = () => api.get<BackofficeBundle[]>("/backoffice/bundles");

/** GET /backoffice/bundles/{id} */
export const get = (id: string) =>
  api.get<BackofficeBundle>(`/backoffice/bundles/${id}`);

/** POST /backoffice/bundles */
export const create = (input: CreateBundleInput) =>
  api.post<BackofficeBundle>("/backoffice/bundles", input);

/** PATCH /backoffice/bundles/{id} */
export const update = (id: string, input: UpdateBundleInput) =>
  api.patch<BackofficeBundle>(`/backoffice/bundles/${id}`, input);

/** DELETE /backoffice/bundles/{id} */
export const remove = (id: string) =>
  api.delete<void>(`/backoffice/bundles/${id}`);
