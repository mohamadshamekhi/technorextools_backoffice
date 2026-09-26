"use server";

import { fail, type ActionResult } from "@/lib/forms";
import { revalidatePath } from "next/cache";
import { bundlesApi, mediaApi, ApiError } from "@/lib/api";
import { pruneNullish } from "@/lib/prune";
import { variantFieldKey } from "./field-keys";
import type {
  BundleWarning,
  CreateBundleInput,
  UpdateBundleInput,
} from "@/lib/api/backoffice/bundles";

/** داده‌ی پاسخ موفق ساخت/ویرایش پکیج */
export type BundleSaveData = { id: string; warnings: BundleWarning[] };

/**
 * خطاهای شناخته‌شده‌ی پکیج را به `ActionResult` تبدیل می‌کند. شرط روی `details.code`
 * است (نه متن پیام) و مقایسه بدون حساسیت به بزرگی/کوچکی حروف انجام می‌شود تا اگر
 * بک‌اند کدها را به lower_snake تغییر داد، پنل نشکند.
 */
function bundleFail(error: unknown, fallback: string): ActionResult<BundleSaveData> {
  if (error instanceof ApiError && error.code?.toLowerCase() === "bundle_item_inactive") {
    const variantId = typeof error.body.details?.variantId === "string"
      ? error.body.details.variantId
      : undefined;
    const fieldErrors: Record<string, string> = { items: "قلم غیرفعال در پکیج وجود دارد." };
    if (variantId) fieldErrors[variantFieldKey(variantId)] = "این قلم غیرفعال است.";
    // پیام بک‌اند فارسی است و نام محصول و SKU را دارد؛ عیناً نمایش داده می‌شود
    return { ok: false, message: error.displayMessage, fieldErrors };
  }
  return fail(error, fallback);
}

export async function createBundleAction(
  input: CreateBundleInput,
): Promise<ActionResult<BundleSaveData>> {
  try {
    const b = await bundlesApi.create(
      pruneNullish(input) as CreateBundleInput,
    );
    revalidatePath("/bundles");
    return { ok: true, data: { id: b.id, warnings: b.warnings ?? [] } };
  } catch (error) {
    return bundleFail(error, "ساخت پکیج ناموفق بود.");
  }
}

export async function updateBundleAction(
  id: string,
  input: UpdateBundleInput,
): Promise<ActionResult<BundleSaveData>> {
  try {
    const b = await bundlesApi.update(id, input);
    revalidatePath("/bundles");
    revalidatePath(`/bundles/${id}`);
    return { ok: true, data: { id: b.id, warnings: b.warnings ?? [] } };
  } catch (error) {
    return bundleFail(error, "ذخیره تغییرات ناموفق بود.");
  }
}

export async function deleteBundleAction(id: string): Promise<ActionResult> {
  try {
    await bundlesApi.remove(id);
    revalidatePath("/bundles");
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف پکیج ناموفق بود.");
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

/** POST /backoffice/media/upload — تصویر پکیج (`ownerType=BUNDLE`، `purpose=GALLERY`) */
export async function uploadBundleImageAction(
  bundleId: string,
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
    typeof sortOrderRaw === "string" && sortOrderRaw !== "" ? Number(sortOrderRaw) : undefined;
  try {
    const media = await mediaApi.upload(file, {
      ownerType: "BUNDLE",
      ownerId: bundleId,
      purpose: "GALLERY",
      folder: "bundles",
      // اولین تصویر پکیج همان کاور است
      isMain: sortOrder === 0,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
    });
    revalidatePath(`/bundles/${bundleId}`);
    return { ok: true, data: { id: media.id, url: media.url } };
  } catch (error) {
    return fail(error, "آپلود تصویر پکیج ناموفق بود.");
  }
}

/** DELETE /backoffice/media/{id} */
export async function deleteBundleImageAction(
  bundleId: string,
  mediaId: string,
): Promise<ActionResult> {
  try {
    await mediaApi.remove(mediaId);
    revalidatePath(`/bundles/${bundleId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف تصویر ناموفق بود.");
  }
}

/** PATCH /backoffice/media/{id} — کاور پکیج */
export async function setBundleMainImageAction(
  bundleId: string,
  mediaId: string,
): Promise<ActionResult> {
  try {
    await mediaApi.update(mediaId, { isMain: true });
    revalidatePath(`/bundles/${bundleId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "ثبت کاور پکیج ناموفق بود.");
  }
}
