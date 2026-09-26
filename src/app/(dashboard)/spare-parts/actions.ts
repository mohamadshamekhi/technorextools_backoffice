"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { sparePartsApi, mediaApi } from "@/lib/api";
import type {
  CreateSparePartInput,
  UpdateSparePartInput,
} from "@/lib/api/backoffice/spare-parts";

export async function createSparePartAction(
  input: CreateSparePartInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const part = await sparePartsApi.create(input);
    revalidatePath("/spare-parts");
    return { ok: true, data: { id: part.id } };
  } catch (error) {
    return fail(error, "ساخت قطعه ناموفق بود.");
  }
}

export async function updateSparePartAction(
  sparePartId: string,
  input: UpdateSparePartInput,
): Promise<ActionResult> {
  try {
    await sparePartsApi.update(sparePartId, input);
    revalidatePath("/spare-parts");
    revalidatePath(`/spare-parts/${sparePartId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره تغییرات ناموفق بود.");
  }
}

export async function deleteSparePartAction(sparePartId: string): Promise<ActionResult> {
  try {
    await sparePartsApi.remove(sparePartId);
    revalidatePath("/spare-parts");
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف قطعه ناموفق بود.");
  }
}

/** جایگزینی قطعات یدکی یک محصول (PUT /backoffice/products/{id}/spare-parts) */
export async function replaceProductSparePartsAction(
  productId: string,
  sparePartIds: string[],
): Promise<ActionResult> {
  try {
    await sparePartsApi.replaceForProduct(productId, sparePartIds);
    revalidatePath(`/products/${productId}`);
    revalidatePath("/spare-parts");
    return { ok: true };
  } catch (error) {
    return fail(error, "ذخیره قطعات یدکی ناموفق بود.");
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

/**
 * آپلود تصویر گالری قطعه‌ی یدکی — `POST /backoffice/media/upload` با
 * `ownerType=SPARE_PART` + `ownerId` + `purpose=GALLERY`. بدون این سه فیلد رکورد رسانه
 * به قطعه نمی‌چسبد و در فروشگاه (`images`/`mainImageUrl`) دیده نمی‌شود.
 */
export async function uploadSparePartImageAction(
  sparePartId: string,
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
  const sortOrderRaw = formData.get("sortOrder");
  const sortOrder =
    typeof sortOrderRaw === "string" && sortOrderRaw !== ""
      ? Number(sortOrderRaw)
      : undefined;
  try {
    const media = await mediaApi.upload(file, {
      ownerType: "SPARE_PART",
      ownerId: sparePartId,
      purpose: "GALLERY",
      folder: "spare-parts",
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
    });
    revalidatePath(`/spare-parts/${sparePartId}`);
    return { ok: true, data: { id: media.id, url: media.url } };
  } catch (error) {
    return fail(error, "آپلود تصویر ناموفق بود.");
  }
}

/** DELETE /backoffice/media/{id} */
export async function deleteSparePartImageAction(
  sparePartId: string,
  mediaId: string,
): Promise<ActionResult> {
  try {
    await mediaApi.remove(mediaId);
    revalidatePath(`/spare-parts/${sparePartId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف تصویر ناموفق بود.");
  }
}

/** PATCH /backoffice/media/{id} — علامت‌گذاری تصویر اصلی قطعه */
export async function setSparePartMainImageAction(
  sparePartId: string,
  mediaId: string,
): Promise<ActionResult> {
  try {
    await mediaApi.update(mediaId, { isMain: true });
    revalidatePath(`/spare-parts/${sparePartId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ثبت تصویر اصلی ناموفق بود.");
  }
}
