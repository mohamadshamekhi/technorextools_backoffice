"use server";

import { mediaApi, ApiError } from "@/lib/api";
import type {
  MediaOwnerType,
  MediaPurpose,
} from "@/lib/api/backoffice/media";

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
 * آپلود یک تصویر از فرم‌های پنل. `formData` باید `file` و اختیاری
 * `purpose` / `folder` / `alt` / `ownerType` / `ownerId` داشته باشد.
 * بک‌اند تصویر را به همان موجودیت می‌چسباند و آدرس عمومی برمی‌گرداند.
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
  const ownerType =
    (formData.get("ownerType") as MediaOwnerType | null) ?? undefined;
  const ownerId = (formData.get("ownerId") as string | null) ?? undefined;

  // بک‌اند این دو را فقط با هم می‌پذیرد؛ نیم‌بند بفرستیم رکورد بی‌مالک می‌ماند
  if (Boolean(ownerType) !== Boolean(ownerId)) {
    return {
      ok: false,
      message: "نوع و شناسه‌ی مالک تصویر باید با هم ارسال شوند.",
    };
  }

  try {
    const media = await mediaApi.upload(file, {
      purpose,
      folder,
      alt,
      ownerType,
      ownerId,
    });
    return { ok: true, url: media.url, id: media.id };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof ApiError ? error.displayMessage : "آپلود تصویر ناموفق بود.",
    };
  }
}

/** نتیجه‌ی آپلود پیوست تیکت؛ `id` همان چیزی است که در `mediaIds` فرستاده می‌شود. */
export type AttachmentUploadResult =
  | { ok: true; id: string; url: string; name: string }
  | { ok: false; message: string };

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

/**
 * آپلود پیوست پیام تیکت. بدون `ownerType` آپلود می‌شود (هنوز پیامی ساخته نشده)؛
 * شناسه‌ی برگشتی باید در `mediaIds` پیام قرار بگیرد.
 */
export async function uploadAttachmentAction(
  formData: FormData,
): Promise<AttachmentUploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "فایلی انتخاب نشده است." };
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return {
      ok: false,
      message: "حجم فایل بیش از حد مجاز است (حداکثر ۲۰ مگابایت).",
    };
  }

  try {
    const media = await mediaApi.upload(file, {
      purpose: "ATTACHMENT",
      folder: "tickets",
    });
    return {
      ok: true,
      id: media.id,
      url: media.url,
      name: media.originalName ?? file.name,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof ApiError ? error.displayMessage : "آپلود فایل ناموفق بود.",
    };
  }
}
