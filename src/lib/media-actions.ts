"use server";

import { mediaApi, ApiError } from "@/lib/api";
import type { MediaPurpose } from "@/lib/api/backoffice/media";

export type UploadResult =
  | { ok: true; url: string; id: string }
  | { ok: false; message: string };

const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/**
 * آپلود یک تصویر از فرم‌های پنل. `formData` باید `file` و اختیاری `purpose` / `folder` / `alt`
 * داشته باشد. آدرس عمومی تصویر برمی‌گردد تا فرم آن را در فیلد url ذخیره کند.
 */
export async function uploadImageAction(
  formData: FormData,
): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "فایلی انتخاب نشده است." };
  }
  if (!ALLOWED.has(file.type)) {
    return { ok: false, message: "فقط تصویر مجاز است (JPEG، PNG، WebP، GIF)." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "حجم تصویر بیش از حد مجاز است (حداکثر ۵۰ مگابایت)." };
  }

  const purpose = (formData.get("purpose") as MediaPurpose | null) ?? undefined;
  const folder = (formData.get("folder") as string | null) ?? undefined;
  const alt = (formData.get("alt") as string | null) ?? undefined;

  try {
    const media = await mediaApi.upload(file, { purpose, folder, alt });
    return { ok: true, url: media.url, id: media.id };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof ApiError ? error.displayMessage : "آپلود تصویر ناموفق بود.",
    };
  }
}
