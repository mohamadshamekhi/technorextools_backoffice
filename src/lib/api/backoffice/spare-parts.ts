import { api, type Paginated } from "../http";

/** قطعات یدکی — docs/api/backoffice.md § Spare Parts. Perm: `spare-parts.manage`. */

export type BackofficeSparePart = {
  id: string;
  title: string;
  slug: string;
  partNumber: string | null;
  price: number;
  stockQty: number;
  weightGrams: number | null;
  isActive: boolean;
  shortDesc?: string | null;
  description?: string | null;
  /** آدرس تصویر اصلی؛ اگر هیچ تصویری `isMain` نباشد، اولین تصویر بر اساس `sortOrder` */
  mainImageUrl?: string | null;
  /** تصاویر قطعه (شکل سبک؛ برای مدیریت گالری از `mediaApi` استفاده می‌شود) */
  images?: SparePartImage[];
  /** محصولات سازگار — کلید واقعی پاسخ بک‌آفیس همین است (نه `products`/`productIds`) */
  compatibleProducts?: SparePartProductRef[];
  createdAt?: string;
};

export type SparePartProductRef = {
  id: string;
  title: string;
  slug?: string;
};

export type SparePartImage = {
  id: string;
  url: string;
  alt: string | null;
  isMain: boolean;
  sortOrder: number;
  variantId: string | null;
};

export type CreateSparePartInput = {
  title: string;
  slug: string;
  partNumber?: string;
  price: number;
  stockQty: number;
  weightGrams?: number;
  isActive: boolean;
  productIds: string[];
};

export type UpdateSparePartInput = Partial<CreateSparePartInput>;

/** پاسخ لیست ممکن است صفحه‌بندی‌شده یا آرایه‌ی ساده باشد */
type ListResponse = Paginated<BackofficeSparePart> | BackofficeSparePart[];

function toItems(res: ListResponse): BackofficeSparePart[] {
  return Array.isArray(res) ? res : res.items;
}

/** GET /backoffice/spare-parts?productId= */
export const list = async (query: { productId?: string; skip?: number; take?: number } = {}) =>
  toItems(await api.get<ListResponse>("/backoffice/spare-parts", { query }));

/** GET /backoffice/spare-parts/{id} */
export const get = (sparePartId: string) =>
  api.get<BackofficeSparePart>(`/backoffice/spare-parts/${sparePartId}`);

/** POST /backoffice/spare-parts */
export const create = (input: CreateSparePartInput) =>
  api.post<BackofficeSparePart>("/backoffice/spare-parts", input);

/** PATCH /backoffice/spare-parts/{id} */
export const update = (sparePartId: string, input: UpdateSparePartInput) =>
  api.patch<BackofficeSparePart>(`/backoffice/spare-parts/${sparePartId}`, input);

/** DELETE /backoffice/spare-parts/{id} */
export const remove = (sparePartId: string) =>
  api.delete<void>(`/backoffice/spare-parts/${sparePartId}`);

/** GET /backoffice/products/{id}/spare-parts */
export const listForProduct = async (productId: string) =>
  toItems(await api.get<ListResponse>(`/backoffice/products/${productId}/spare-parts`));

/** PUT /backoffice/products/{id}/spare-parts — جایگزینی کل مجموعه */
export const replaceForProduct = (productId: string, sparePartIds: string[]) =>
  api.put<unknown>(`/backoffice/products/${productId}/spare-parts`, { sparePartIds });
