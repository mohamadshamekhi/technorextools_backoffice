import { api, type Paginated } from "../http";
import type { ListQuery } from "./common";
import type { MediaView } from "./media";

/**
 * محصولات بک‌آفیس — طبق schemaهای Zod واقعی سرویس (نه مستندات حدسی؛ مرجع کامل: مستند
 * «مرجع API بک‌آفیس»، بخش «محصولات»). چند نکته‌ی مهم که کد این فایل را شکل داده:
 * - `shortDesc`/`description` روی createProductSchema نال‌پذیرند ولی کلیدشان الزامی است؛
 *   خالی یعنی `null`، نه حذف کلید (حذف = خطای «Required»).
 * - `brandId` واقعاً اختیاری/نال‌پذیر است — محصول بدون برند مجاز است.
 * - `GET /backoffice/products/{id}` → `ProductDetail` کامل شامل
 *   `images[]`, `variants[]`, `attributeValues[]`, `relatedProductIds[]`.
 */

export type ProductRef = {
  id: string;
  title: string;
};

/** مقدار یک ویژگی (اتریبیوت) روی محصول — همان چیزی که با Replace Attribute Values ست می‌شود */
export type ProductAttributeValue = {
  attributeId: string;
  value: string;
};

export type BackofficeProduct = {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  description: string | null;
  basePrice: number;
  category: ProductRef | null;
  brand: ProductRef | null;
  isActive: boolean;
  isAmazingDeal: boolean;
  createdAt: string;
  images?: MediaView[];
  variants?: ProductVariant[];
  attributeValues?: ProductAttributeValue[];
  relatedProductIds?: string[];
};

export type ListProductsQuery = ListQuery & {
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  isAmazingDeal?: boolean;
};

export type CreateProductInput = {
  title: string;
  slug: string;
  categoryId: string;
  /** اختیاری/نال‌پذیر — محصول می‌تواند بدون برند ساخته شود */
  brandId?: string | null;
  /** کلید الزامی، مقدار نال‌پذیر — بدون توضیح کوتاه حتماً `null` بفرست، نه حذف کلید */
  shortDesc: string | null;
  /** همین قانون shortDesc */
  description: string | null;
  basePrice: number;
  isAmazingDeal?: boolean;
  isActive?: boolean;
};

export type UpdateProductInput = Partial<CreateProductInput>;

/** یک واریانت محصول (رنگ/کد کالا)؛ موجودی و لایه‌های قیمت از دامنه‌ی Inventory مدیریت می‌شود */
export type ProductVariant = {
  id: string;
  sku: string;
  colorName: string | null;
  stockQty: number;
  priceOverride: number | null;
  weightGrams: number | null;
  isActive: boolean;
};

export type CreateVariantInput = {
  sku: string;
  /** کلید الزامی، نال‌پذیر — بدون رنگ حتماً null */
  colorName: string | null;
  stockQty?: number;
  /** کلید الزامی، نال‌پذیر — null یعنی قیمت پایه محصول اعمال شود */
  priceOverride: number | null;
  weightGrams?: number | null;
  isActive?: boolean;
};

/** فقط sku/colorName/isActive قابل تغییر است؛ موجودی/وزن/قیمت از inventoryApi.update */
export type UpdateVariantInput = {
  sku?: string;
  colorName?: string | null;
  isActive?: boolean;
};

/** GET /backoffice/products */
export const list = (query: ListProductsQuery = {}) =>
  api.get<Paginated<BackofficeProduct>>("/backoffice/products", { query });

/** GET /backoffice/products/{id} */
export const get = (productId: string) =>
  api.get<BackofficeProduct>(`/backoffice/products/${productId}`);

/** POST /backoffice/products */
export const create = (input: CreateProductInput) =>
  api.post<BackofficeProduct>("/backoffice/products", input);

/** PATCH /backoffice/products/{id} */
export const update = (productId: string, input: UpdateProductInput) =>
  api.patch<BackofficeProduct>(`/backoffice/products/${productId}`, input);

/** DELETE /backoffice/products/{id} — soft-delete (deletedAt) */
export const remove = (productId: string) =>
  api.delete<void>(`/backoffice/products/${productId}`);

/** PUT /backoffice/products/{id}/attribute-values — کل مجموعه جایگزین می‌شود (حداکثر ۱۰۰) */
export const replaceAttributeValues = (
  productId: string,
  values: ProductAttributeValue[],
) =>
  api.put<ProductAttributeValue[]>(
    `/backoffice/products/${productId}/attribute-values`,
    { values },
  );

/** PUT /backoffice/products/{id}/related — حداکثر ۵۰، بدون خودِ محصول */
export const replaceRelated = (productId: string, relatedProductIds: string[]) =>
  api.put<BackofficeProduct>(`/backoffice/products/${productId}/related`, {
    relatedProductIds,
  });

/** POST /backoffice/products/{id}/variants */
export const createVariant = (productId: string, input: CreateVariantInput) =>
  api.post<ProductVariant>(
    `/backoffice/products/${productId}/variants`,
    input,
  );

/** PATCH /backoffice/products/{id}/variants/{variantId} */
export const updateVariant = (
  productId: string,
  variantId: string,
  input: UpdateVariantInput,
) =>
  api.patch<ProductVariant>(
    `/backoffice/products/${productId}/variants/${variantId}`,
    input,
  );
