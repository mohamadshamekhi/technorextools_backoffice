import { api } from "../http";

/** برندها — docs/api/backoffice.md § Brands. Perm: `brands.manage`. */

export type BackofficeBrand = {
  id: string;
  title: string;
  slug: string;
  /** فقط خواندنی — با آپلود رسانه (`ownerType=BRAND`, `purpose=LOGO`) ست می‌شود. */
  logoUrl: string | null;
  isExclusiveDistributor: boolean;
  authenticityNote: string | null;
  createdAt: string;
};

/** بدنه دیگر `logoUrl` نمی‌گیرد؛ لوگو با `POST /backoffice/media/upload` آپلود می‌شود. */
export type CreateBrandInput = {
  title: string;
  slug: string;
  isExclusiveDistributor?: boolean;
  authenticityNote?: string | null;
};

export type UpdateBrandInput = Partial<CreateBrandInput>;

/** GET /backoffice/brands */
export const list = () => api.get<BackofficeBrand[]>("/backoffice/brands");

/** GET /backoffice/brands/{id} */
export const get = (brandId: string) =>
  api.get<BackofficeBrand>(`/backoffice/brands/${brandId}`);

/** POST /backoffice/brands */
export const create = (input: CreateBrandInput) =>
  api.post<BackofficeBrand>("/backoffice/brands", input);

/** PATCH /backoffice/brands/{id} */
export const update = (brandId: string, input: UpdateBrandInput) =>
  api.patch<BackofficeBrand>(`/backoffice/brands/${brandId}`, input);

/** DELETE /backoffice/brands/{id} */
export const remove = (brandId: string) =>
  api.delete<void>(`/backoffice/brands/${brandId}`);
