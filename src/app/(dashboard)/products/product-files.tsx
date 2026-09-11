"use client";

import { useRef, useState, useTransition } from "react";
import type { ComponentType } from "react";
import { Box, FileText, Loader2, Upload, X } from "lucide-react";
import {
  uploadProductCatalogAction,
  uploadProductModelAction,
  deleteProductMediaAction,
} from "./actions";
import type { ActionResult } from "@/lib/forms";
import type { MediaPurpose, MediaView } from "@/lib/api/backoffice/media";
import { formatFileSize } from "@/lib/format";

/**
 * یک اسلات آپلود تکی (کاتالوگ یا فایل سه‌بعدی): تا وقتی فایلی نیست دکمه‌ی
 * افزودن نشان می‌دهد؛ بعد از آپلود، نام/حجم فایل + دکمه‌ی حذف.
 */
function FileSlot({
  productId,
  icon: Icon,
  label,
  accept,
  hint,
  purpose,
  mediaKind,
  initial,
  upload,
}: {
  productId: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  accept: string;
  hint: string;
  purpose: MediaPurpose;
  mediaKind: MediaView["kind"];
  initial: MediaView | null;
  upload: (productId: string, form: FormData) => Promise<ActionResult<{ id: string; url: string }>>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<MediaView | null>(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pick() {
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = ""; // اجازه‌ی انتخاب دوباره‌ی همان فایل
    if (!picked) return;
    setError(null);
    startTransition(async () => {
      const form = new FormData();
      form.set("file", picked);
      const res = await upload(productId, form);
      if (res.ok && res.data) {
        setFile({
          id: res.data.id,
          url: res.data.url,
          key: "",
          contentType: picked.type,
          size: picked.size,
          originalName: picked.name,
          kind: mediaKind,
          ownerType: "PRODUCT",
          ownerId: productId,
          purpose,
          alt: null,
          isMain: false,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
        });
      } else if (!res.ok) {
        setError(res.message);
      }
    });
  }

  function handleDelete() {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteProductMediaAction(productId, file.id);
      if (res.ok) setFile(null);
      else setError(res.message);
    });
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-primary" />
        {label}
      </div>
      <p className="mt-1 text-xs text-muted">{hint}</p>

      <input ref={inputRef} type="file" accept={accept} hidden onChange={handleChange} />

      {file ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-sm">
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center gap-2 text-primary hover:underline"
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{file.originalName ?? label}</span>
          </a>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-muted">{formatFileSize(file.size)}</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              aria-label={`حذف ${label}`}
              className="rounded p-1 text-muted hover:text-danger disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <X className="size-3.5" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={isPending}
          className="mt-3 flex h-10 items-center gap-2 rounded-lg border border-dashed px-4 text-sm text-muted hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {isPending ? "در حال بارگذاری…" : `افزودن ${label}`}
        </button>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** تب «فایل‌ها»ی محصول: کاتالوگ (PDF) و فایل سه‌بعدی، هرکدام یک فایل. */
export function ProductFiles({
  productId,
  initialCatalog,
  initialModel,
}: {
  productId: string;
  initialCatalog: MediaView | null;
  initialModel: MediaView | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FileSlot
        productId={productId}
        icon={FileText}
        label="کاتالوگ محصول"
        accept="application/pdf"
        hint="فایل PDF کاتالوگ یا دیتاشیت — حداکثر ۲۰ مگابایت."
        purpose="DATASHEET"
        mediaKind="DOCUMENT"
        initial={initialCatalog}
        upload={uploadProductCatalogAction}
      />
      <FileSlot
        productId={productId}
        icon={Box}
        label="فایل سه‌بعدی"
        accept=".glb,.gltf,.obj,.fbx,.stl,.stp,.step"
        hint="فرمت‌های مجاز: glb، gltf، obj، fbx، stl، stp، step — حداکثر ۱۰۰ مگابایت."
        purpose="MODEL_3D"
        mediaKind="MODEL"
        initial={initialModel}
        upload={uploadProductModelAction}
      />
    </div>
  );
}
