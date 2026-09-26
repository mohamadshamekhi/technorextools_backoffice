"use server";

import { fail, invalid, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { sparePartsApi, productsApi, mediaApi, inventoryApi } from "@/lib/api";
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
  ProductAttributeValue,
  ProductPart,
  ProductHighlight,
  Model3dHotspotInput,
  ProductDocument,
  CreateProductDocumentInput,
  UpdateProductDocumentInput,
  BulkPriceUpdateInput,
  BulkPriceUpdateResult,
} from "@/lib/api/backoffice/products";
import type { UpdateInventoryVariantInput } from "@/lib/api/backoffice/inventory";

/** POST /backoffice/products */
export async function createProductAction(
  input: CreateProductInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const product = await productsApi.create(input);
    revalidatePath("/products");
    return { ok: true, data: { id: product.id } };
  } catch (error) {
    return fail(error, "ساخت محصول ناموفق بود.");
  }
}

/** PATCH /backoffice/products/{id} */
export async function updateProductAction(
  productId: string,
  input: UpdateProductInput,
): Promise<ActionResult> {
  try {
    await productsApi.update(productId, input);
    revalidatePath(`/products/${productId}`);
    revalidatePath("/products");
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره تغییرات ناموفق بود.");
  }
}

/** DELETE /backoffice/products/{id} */
export async function deleteProductAction(
  productId: string,
): Promise<ActionResult> {
  try {
    await productsApi.remove(productId);
    revalidatePath("/products");
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف محصول ناموفق بود.");
  }
}

/** دامنه‌ی هدف تغییر قیمت گروهی — دقیقاً یکی از سه حالت */
export type BulkPriceScopeInput =
  | { type: "brand"; brandId: string }
  | { type: "category"; categoryId: string }
  | { type: "products"; productIds: string[] };

/** پیش‌نمایش تعداد محصولات مطابق دامنه، پیش از تأیید تغییر قیمت گروهی */
export async function previewBulkPriceScopeAction(
  scope: BulkPriceScopeInput,
): Promise<ActionResult<{ count: number }>> {
  if (scope.type === "products") {
    return { ok: true, data: { count: scope.productIds.length } };
  }
  try {
    const { total } = await productsApi.list({
      take: 1,
      brandId: scope.type === "brand" ? scope.brandId : undefined,
      categoryId: scope.type === "category" ? scope.categoryId : undefined,
    });
    return { ok: true, data: { count: total } };
  } catch (error) {
    return fail(error, "شمارش محصولات مطابق ناموفق بود.");
  }
}

/** جست‌وجوی محصول برای انتخاب دستی در تغییر قیمت گروهی */
export async function searchProductsForBulkPriceAction(
  search: string,
): Promise<ActionResult<{ id: string; title: string }[]>> {
  try {
    const { items } = await productsApi.list({ search, take: 20 });
    return { ok: true, data: items.map((p) => ({ id: p.id, title: p.title })) };
  } catch (error) {
    return fail(error, "جست‌وجوی محصول ناموفق بود.");
  }
}

/** POST /backoffice/products/bulk-price-update */
export async function bulkPriceUpdateAction(
  scope: BulkPriceScopeInput,
  mode: BulkPriceUpdateInput["mode"],
  direction: BulkPriceUpdateInput["direction"],
  value: number,
): Promise<ActionResult<BulkPriceUpdateResult>> {
  if (!Number.isFinite(value) || value <= 0) {
    return invalid({ value: "مقدار باید عددی بزرگ‌تر از صفر باشد." });
  }
  if (mode === "percent" && direction === "decrease" && value > 100) {
    return invalid({ value: "درصد کاهش نمی‌تواند بیشتر از ۱۰۰ باشد." });
  }
  if (scope.type === "products" && scope.productIds.length === 0) {
    return invalid({ scope: "حداقل یک محصول انتخاب کنید." });
  }

  const input: BulkPriceUpdateInput = {
    mode,
    direction,
    value,
    brandId: scope.type === "brand" ? scope.brandId : undefined,
    categoryId: scope.type === "category" ? scope.categoryId : undefined,
    productIds: scope.type === "products" ? scope.productIds : undefined,
  };

  try {
    const result = await productsApi.bulkPriceUpdate(input);
    revalidatePath("/products");
    return { ok: true, data: result };
  } catch (error) {
    return fail(error, "تغییر قیمت گروهی ناموفق بود.");
  }
}

/** PUT /backoffice/products/{id}/attribute-values — ذخیره‌ی مشخصات فنی */
export async function replaceAttributeValuesAction(
  productId: string,
  values: ProductAttributeValue[],
): Promise<ActionResult> {
  try {
    await productsApi.replaceAttributeValues(productId, values);
    revalidatePath(`/products/${productId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره مشخصات فنی ناموفق بود.");
  }
}

/** PUT /backoffice/products/{id}/parts — ذخیره‌ی کل لیست قطعات نقشه‌ی انفجاری */
export async function replaceProductPartsAction(
  productId: string,
  parts: ProductPart[],
  /** شناسه‌ی قطعات یدکی انتخاب‌شده در همین فرم — مجموعه‌ی قطعات یدکی محصول هم با آن یکی می‌شود */
  sparePartIds: string[] = [],
): Promise<ActionResult> {
  try {
    await productsApi.replaceParts(productId, parts);
    await sparePartsApi.replaceForProduct(productId, [...new Set(sparePartIds)]);
    revalidatePath(`/products/${productId}`);
    revalidatePath("/spare-parts");
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره قطعات نقشه انفجاری ناموفق بود.");
  }
}

/** POST /backoffice/products/{id}/variants */
export async function createVariantAction(
  productId: string,
  input: CreateVariantInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const variant = await productsApi.createVariant(productId, input);
    revalidatePath(`/products/${productId}`);
    return { ok: true, data: { id: variant.id } };
  } catch (error) {
    return fail(error, "ساخت واریانت ناموفق بود.");
  }
}

/** PATCH /backoffice/products/{id}/variants/{variantId} — فقط sku/colorName/isActive */
export async function updateVariantAction(
  productId: string,
  variantId: string,
  input: UpdateVariantInput,
): Promise<ActionResult> {
  try {
    await productsApi.updateVariant(productId, variantId, input);
    revalidatePath(`/products/${productId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره واریانت ناموفق بود.");
  }
}

/** PATCH /backoffice/inventory/variants/{id} — موجودی/قیمت جایگزین واریانت */
export async function updateVariantStockAction(
  productId: string,
  variantId: string,
  input: UpdateInventoryVariantInput,
): Promise<ActionResult> {
  try {
    await inventoryApi.update(variantId, input);
    revalidatePath(`/products/${productId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره موجودی/قیمت ناموفق بود.");
  }
}

const MAX_IMAGE_BYTES = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/** آپلود یک تصویر گالری و اتصال آن به محصول (POST /backoffice/media/upload با ownerType/ownerId) */
export async function uploadProductImageAction(
  productId: string,
  formData: FormData,
): Promise<ActionResult<{ id: string; url: string }>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "فایلی انتخاب نشده است." };
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { ok: false, message: "فقط تصویر مجاز است (JPEG، PNG، WebP، GIF)." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: "حجم تصویر بیش از حد مجاز است (حداکثر ۵۰ مگابایت)." };
  }
  try {
    const sortOrderRaw = formData.get("sortOrder");
    const sortOrder =
      typeof sortOrderRaw === "string" && sortOrderRaw !== ""
        ? Number(sortOrderRaw)
        : undefined;
    const media = await mediaApi.upload(file, {
      ownerType: "PRODUCT",
      ownerId: productId,
      purpose: "GALLERY",
      folder: "products",
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
    });
    revalidatePath(`/products/${productId}`);
    return { ok: true, data: { id: media.id, url: media.url } };
  } catch (error) {
    return fail(error, "آپلود تصویر ناموفق بود.");
  }
}

/** DELETE /backoffice/media/{id} */
export async function deleteProductImageAction(
  productId: string,
  mediaId: string,
): Promise<ActionResult> {
  try {
    await mediaApi.remove(mediaId);
    revalidatePath(`/products/${productId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف تصویر ناموفق بود.");
  }
}

/** PATCH /backoffice/media/{id} — علامت‌گذاری به‌عنوان تصویر اصلی */
export async function setMainImageAction(
  productId: string,
  mediaId: string,
): Promise<ActionResult> {
  try {
    await mediaApi.update(mediaId, { isMain: true });
    revalidatePath(`/products/${productId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ثبت تصویر اصلی ناموفق بود.");
  }
}

const MAX_CATALOG_BYTES = 20 * 1024 * 1024;
const MAX_MODEL_BYTES = 100 * 1024 * 1024;
const MODEL_3D_EXTENSIONS = [".glb", ".gltf", ".obj", ".fbx", ".stl", ".stp", ".step"];

function hasExtension(name: string, extensions: string[]): boolean {
  const lower = name.toLowerCase();
  return extensions.some((ext) => lower.endsWith(ext));
}

/** آپلود کاتالوگ (PDF) و اتصال آن به محصول — purpose: DATASHEET */
export async function uploadProductCatalogAction(
  productId: string,
  formData: FormData,
): Promise<ActionResult<{ id: string; url: string }>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "فایلی انتخاب نشده است." };
  }
  if (file.type !== "application/pdf" && !hasExtension(file.name, [".pdf"])) {
    return { ok: false, message: "فقط فایل PDF مجاز است." };
  }
  if (file.size > MAX_CATALOG_BYTES) {
    return { ok: false, message: "حجم فایل بیش از حد مجاز است (حداکثر ۲۰ مگابایت)." };
  }
  try {
    const media = await mediaApi.upload(file, {
      ownerType: "PRODUCT",
      ownerId: productId,
      purpose: "DATASHEET",
      folder: "products",
    });
    revalidatePath(`/products/${productId}`);
    return { ok: true, data: { id: media.id, url: media.url } };
  } catch (error) {
    return fail(error, "آپلود کاتالوگ ناموفق بود.");
  }
}

/** آپلود فایل سه‌بعدی و اتصال آن به محصول — purpose: MODEL_3D */
export async function uploadProductModelAction(
  productId: string,
  formData: FormData,
): Promise<ActionResult<{ id: string; url: string }>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "فایلی انتخاب نشده است." };
  }
  // مرورگرها نوع MIME فایل‌های سه‌بعدی را معمولاً درست گزارش نمی‌دهند؛ اعتبارسنجی بر اساس پسوند.
  if (!hasExtension(file.name, MODEL_3D_EXTENSIONS)) {
    return {
      ok: false,
      message: `فرمت فایل مجاز نیست. فرمت‌های مجاز: ${MODEL_3D_EXTENSIONS.join("، ")}`,
    };
  }
  if (file.size > MAX_MODEL_BYTES) {
    return { ok: false, message: "حجم فایل بیش از حد مجاز است (حداکثر ۱۰۰ مگابایت)." };
  }
  try {
    const media = await mediaApi.upload(file, {
      ownerType: "PRODUCT",
      ownerId: productId,
      purpose: "MODEL_3D",
      folder: "products",
    });
    revalidatePath(`/products/${productId}`);
    return { ok: true, data: { id: media.id, url: media.url } };
  } catch (error) {
    return fail(error, "آپلود فایل سه‌بعدی ناموفق بود.");
  }
}

/** آپلود عکس انفجاری و اتصال آن به محصول — purpose: EXPLODED_VIEW */
export async function uploadProductExplodedViewAction(
  productId: string,
  formData: FormData,
): Promise<ActionResult<{ id: string; url: string }>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "فایلی انتخاب نشده است." };
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { ok: false, message: "فقط تصویر مجاز است (JPEG، PNG، WebP، GIF)." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: "حجم تصویر بیش از حد مجاز است (حداکثر ۵۰ مگابایت)." };
  }
  try {
    const media = await mediaApi.upload(file, {
      ownerType: "PRODUCT",
      ownerId: productId,
      purpose: "EXPLODED_VIEW",
      folder: "products",
    });
    revalidatePath(`/products/${productId}`);
    return { ok: true, data: { id: media.id, url: media.url } };
  } catch (error) {
    return fail(error, "آپلود عکس انفجاری ناموفق بود.");
  }
}

/** DELETE /backoffice/media/{id} — حذف هر فایل ضمیمه‌ی محصول (کاتالوگ/فایل سه‌بعدی/عکس انفجاری) */
export async function deleteProductMediaAction(
  productId: string,
  mediaId: string,
): Promise<ActionResult> {
  try {
    await mediaApi.remove(mediaId);
    revalidatePath(`/products/${productId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف فایل ناموفق بود.");
  }
}

/** PUT /backoffice/products/{id}/highlights — ذخیره‌ی کل نوار مشخصات شاخص */
export async function replaceHighlightsAction(
  productId: string,
  highlights: ProductHighlight[],
): Promise<ActionResult> {
  try {
    await productsApi.replaceHighlights(productId, highlights);
    revalidatePath(`/products/${productId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره مشخصات شاخص ناموفق بود.");
  }
}

/** PUT /backoffice/products/{id}/model3d-hotspots — ذخیره‌ی کل نقاط مدل سه‌بعدی */
export async function replaceModel3dHotspotsAction(
  productId: string,
  hotspots: Model3dHotspotInput[],
): Promise<ActionResult> {
  try {
    await productsApi.replaceModel3dHotspots(productId, hotspots);
    revalidatePath(`/products/${productId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره نقاط مدل سه‌بعدی ناموفق بود.");
  }
}

const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

/**
 * افزودن سند محصول: اول فایل PDF روی مدیا آپلود می‌شود (`purpose: DATASHEET`)
 * و بعد `mediaId` به `POST /backoffice/products/{id}/documents` می‌رود.
 * خروجی، لیست کامل و تازه‌ی اسناد محصول است.
 */
export async function addProductDocumentAction(
  productId: string,
  formData: FormData,
  meta: Omit<CreateProductDocumentInput, "mediaId">,
): Promise<ActionResult<ProductDocument[]>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "فایلی انتخاب نشده است." };
  }
  if (file.type !== "application/pdf" && !hasExtension(file.name, [".pdf"])) {
    return { ok: false, message: "فقط فایل PDF مجاز است." };
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return { ok: false, message: "حجم فایل بیش از حد مجاز است (حداکثر ۲۰ مگابایت)." };
  }
  if (!meta.title.trim()) {
    return invalid({ title: "عنوان سند را وارد کنید." });
  }
  try {
    const media = await mediaApi.upload(file, {
      ownerType: "PRODUCT",
      ownerId: productId,
      purpose: "DATASHEET",
      folder: "products",
    });
    const documents = await productsApi.createDocument(productId, {
      ...meta,
      title: meta.title.trim(),
      mediaId: media.id,
    });
    revalidatePath(`/products/${productId}`);
    return { ok: true, data: documents };
  } catch (error) {
    return fail(error, "افزودن سند ناموفق بود.");
  }
}

/** PATCH /backoffice/products/{id}/documents/{documentId} */
export async function updateProductDocumentAction(
  productId: string,
  documentId: string,
  input: UpdateProductDocumentInput,
): Promise<ActionResult<ProductDocument[]>> {
  if (input.title !== undefined && !input.title.trim()) {
    return invalid({ title: "عنوان سند را وارد کنید." });
  }
  try {
    const documents = await productsApi.updateDocument(productId, documentId, input);
    revalidatePath(`/products/${productId}`);
    return { ok: true, data: documents };
  } catch (error) {
    return fail(error, "ذخیره سند ناموفق بود.");
  }
}

/** DELETE /backoffice/products/{id}/documents/{documentId} — فقط رکورد سند */
export async function deleteProductDocumentAction(
  productId: string,
  documentId: string,
): Promise<ActionResult> {
  try {
    await productsApi.removeDocument(productId, documentId);
    revalidatePath(`/products/${productId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف سند ناموفق بود.");
  }
}
