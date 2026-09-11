"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { uploadImageAction } from "@/lib/media-actions";
import type { MediaPurpose } from "@/lib/api/backoffice/media";

/**
 * انتخاب و آپلود تصویر. فایل را به `uploadImageAction` می‌فرستد و آدرس عمومی برگشتی را
 * از طریق `onChange` به فرم می‌دهد؛ فرم همان url را در فیلد خودش ذخیره می‌کند.
 */
export function ImageUploader({
  value,
  onChange,
  purpose,
  folder,
  alt,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  purpose: MediaPurpose;
  folder: string;
  alt?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pick() {
    inputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // اجازه‌ی انتخاب دوباره‌ی همان فایل
    if (!file) return;
    setError(null);
    const form = new FormData();
    form.set("file", file);
    form.set("purpose", purpose);
    form.set("folder", folder);
    if (alt) form.set("alt", alt);
    startTransition(async () => {
      const res = await uploadImageAction(form);
      if (res.ok) onChange(res.url);
      else setError(res.message);
    });
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />

      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={alt ?? "تصویر بارگذاری‌شده"}
            className="h-32 w-32 rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
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

      {value && (
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

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
