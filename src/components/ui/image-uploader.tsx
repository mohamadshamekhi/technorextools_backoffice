"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { uploadImageAction, type UploadResult } from "@/lib/media-actions";
import type { MediaOwnerType, MediaPurpose } from "@/lib/api/backoffice/media";

/** مالک تصویر در بک‌اند؛ آپلود باید روی همین موجودیت انجام شود. */
export type ImageOwner = { type: MediaOwnerType; id: string };

/**
 * آپلود یک تصویر روی یک موجودیت. بک‌اند دیگر فیلد url را در بدنه‌ی موجودیت نمی‌پذیرد؛
 * تصویر باید با `ownerType`/`ownerId` روی `POST /backoffice/media/upload` بارگذاری شود.
 *
 * دو حالت:
 * - `owner` مشخص است (ویرایش) → فایل بلافاصله آپلود می‌شود و `onChange` با url عمومی صدا زده می‌شود.
 * - `owner` نال است (ساخت؛ هنوز شناسه‌ای وجود ندارد) → فایل فقط پیش‌نمایش می‌شود و از طریق
 *   `onFileSelect` به فرم داده می‌شود تا بعد از ساخت موجودیت با `uploadOwnedImage` آپلود شود.
 */
export function ImageUploader({
  value,
  onChange,
  purpose,
  folder,
  alt,
  owner,
  onFileSelect,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  purpose: MediaPurpose;
  folder: string;
  alt?: string;
  /**
   * `ImageOwner` → آپلود فوری روی همان موجودیت.
   * `null` → تعویق تا ساخته‌شدن موجودیت (فقط پیش‌نمایش + `onFileSelect`).
   * الزامی است تا هیچ آپلودی بدون `ownerType`/`ownerId` انجام نشود (چنین رکوردی
   * به موجودیت نمی‌چسبد و در فروشگاه نمایش داده نمی‌شود).
   */
  owner: ImageOwner | null;
  onFileSelect?: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // پیش‌نمایش محلی برای حالت «هنوز آپلود نشده»
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function pick() {
    inputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // اجازه‌ی انتخاب دوباره‌ی همان فایل
    if (!file) return;
    setError(null);

    if (owner === null) {
      // ساخت موجودیت: آپلود موکول به بعد از گرفتن شناسه می‌شود
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      onFileSelect?.(file);
      return;
    }

    startTransition(async () => {
      const res = await uploadOwnedImage(file, {
        purpose,
        folder,
        alt,
        ownerType: owner.type,
        ownerId: owner.id,
      });
      if (res.ok) {
        setPreview(null);
        onFileSelect?.(null);
        onChange(res.url);
      } else {
        setError(res.message);
      }
    });
  }

  function clear() {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    onFileSelect?.(null);
    onChange(null);
  }

  const shown = preview ?? value;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />

      {shown ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shown}
            alt={alt ?? "تصویر بارگذاری‌شده"}
            className="h-32 w-32 rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={clear}
            aria-label="حذف تصویر"
            className="absolute -end-2 -top-2 rounded-full border bg-surface p-1 text-muted shadow-sm hover:text-danger"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={isPending}
          className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <ImageIcon className="size-6" />
          )}
          <span className="text-xs">
            {isPending ? "در حال بارگذاری…" : "انتخاب تصویر"}
          </span>
        </button>
      )}

      {shown && (
        <button
          type="button"
          onClick={pick}
          disabled={isPending}
          className="flex items-center gap-1.5 text-sm text-primary hover:opacity-80 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          جایگزینی تصویر
        </button>
      )}

      {preview && owner === null && (
        <p className="text-xs text-muted">
          تصویر پس از ثبت فرم بارگذاری می‌شود.
        </p>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

/** آپلود یک تصویر روی موجودیت مشخص؛ فرم‌ها بعد از ساخت موجودیت از این استفاده می‌کنند. */
export async function uploadOwnedImage(
  file: File,
  fields: {
    purpose: MediaPurpose;
    folder: string;
    alt?: string;
    ownerType?: MediaOwnerType;
    ownerId?: string;
  },
): Promise<UploadResult> {
  const form = new FormData();
  form.set("file", file);
  form.set("purpose", fields.purpose);
  form.set("folder", fields.folder);
  if (fields.alt) form.set("alt", fields.alt);
  if (fields.ownerType) form.set("ownerType", fields.ownerType);
  if (fields.ownerId) form.set("ownerId", fields.ownerId);
  return uploadImageAction(form);
}
