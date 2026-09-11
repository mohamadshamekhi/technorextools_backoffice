"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { productsApi, mediaApi, inventoryApi } from "@/lib/api";
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
  ProductAttributeValue,
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
    const media = await mediaApi.upload(file, {
      ownerType: "PRODUCT",
      ownerId: productId,
      purpose: "GALLERY",
      folder: "products",
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

/** DELETE /backoffice/media/{id} — حذف هر فایل ضمیمه‌ی محصول (کاتالوگ/فایل سه‌بعدی) */
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
