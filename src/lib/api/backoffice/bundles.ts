import { api } from "../http";

/** پکیج‌ها — docs/api/backoffice.md § Bundles. Perm: `bundles.manage`. */

export type BundleItem = {
  variantId: string;
  qty: number;
  title?: string | null;
  /** موجودی و فعال‌بودن واریانت (فعال‌بودن محصول هم در آن لحاظ شده) */
  stockQty?: number;
  isActive?: boolean;
  sku?: string | null;
};

/** هشدار پاسخ موفق ساخت/ویرایش پکیج — ذخیره انجام شده ولی پکیج در سایت دیده نمی‌شود */
export type BundleWarning = {
  code: string;
  variantId: string;
  sku: string;
  stockQty: number;
  requiredQty: number;
};

/** پاسخ POST/PATCH: خود پکیج به‌علاوه‌ی هشدارها */
export type BundleMutationResult = BackofficeBundle & { warnings?: BundleWarning[] };

export type BackofficeBundle = {
  id: string;
  title: string;
  slug: string;
  bundlePrice: number;
  isActive: boolean;
  items: BundleItem[];
  /** بک‌اند: آیا پکیج در سایت نمایش داده می‌شود (همه‌ی اقلام فعال و موجود) */
  available?: boolean;
  /** بک‌اند: چند بسته از این پکیج با موجودی فعلی قابل فروش است */
  packagesInStock?: number;
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
  api.post<BundleMutationResult>("/backoffice/bundles", input);

/** PATCH /backoffice/bundles/{id} */
export const update = (id: string, input: UpdateBundleInput) =>
  api.patch<BundleMutationResult>(`/backoffice/bundles/${id}`, input);

/** DELETE /backoffice/bundles/{id} */
export const remove = (id: string) =>
  api.delete<void>(`/backoffice/bundles/${id}`);
