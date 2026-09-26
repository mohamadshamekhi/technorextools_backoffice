"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, X, Loader2, ImageIcon, Star } from "lucide-react";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import type { ActionResult } from "@/lib/forms";
import type { MediaOwnerType, MediaView } from "@/lib/api/backoffice/media";

/**
 * گالری تصاویر یک موجودیت (محصول، قطعه‌ی یدکی، …): آپلود چندتایی، حذف و انتخاب تصویر اصلی.
 * خودِ فراخوانی بک‌اند در سرور اکشن‌های هم‌محل با هر دامنه انجام می‌شود و از طریق
 * propهای `onUpload`/`onDelete`/`onSetMain` داده می‌شود؛ این کامپوننت فقط UI و state محلی است.
 *
 * نکته‌ی مهم: آپلود حتماً باید `ownerType` + `ownerId` + `purpose=GALLERY` بفرستد، وگرنه
 * رکورد رسانه به موجودیت نمی‌چسبد و در فروشگاه نمایش داده نمی‌شود.
 */
export function MediaGallery({
  ownerType,
  ownerId,
  initial,
  emptyMessage,
  imageAlt,
  onUpload,
  onDelete,
  onSetMain,
}: {
  ownerType: MediaOwnerType;
  ownerId: string;
  initial: MediaView[];
  emptyMessage: string;
  imageAlt: string;
  /** آپلود یک فایل؛ `sortOrder` ترتیب نمایش (از ۰) است */
  onUpload: (
    file: File,
    sortOrder: number,
  ) => Promise<ActionResult<{ id: string; url: string }>>;
  onDelete: (mediaId: string) => Promise<ActionResult>;
  onSetMain: (mediaId: string) => Promise<ActionResult>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<MediaView[]>(initial);
  const [isUploading, startUpload] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function pick() {
    inputRef.current?.click();
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // اجازه‌ی انتخاب دوباره‌ی همان فایل‌ها
    if (files.length === 0) return;
    setError(null);
    startUpload(async () => {
      let sortOrder = images.length;
      for (const file of files) {
        const res = await onUpload(file, sortOrder);
        if (res.ok && res.data) {
          const uploaded: MediaView = {
            id: res.data.id,
            url: res.data.url,
            key: "",
            contentType: file.type,
            size: file.size,
            originalName: file.name,
            kind: "IMAGE",
            ownerType,
            ownerId,
            purpose: "GALLERY",
            alt: null,
            isMain: false,
            sortOrder,
            createdAt: new Date().toISOString(),
          };
          sortOrder += 1;
          setImages((prev) => [...prev, uploaded]);
        } else if (!res.ok) {
          setError(res.message);
        }
      }
    });
  }

  function handleDelete(id: string) {
    setError(null);
    startUpload(async () => {
      const res = await onDelete(id);
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id));
      } else {
        setError(res.message);
      }
    });
  }

  function handleSetMain(id: string) {
    setError(null);
    startUpload(async () => {
      const res = await onSetMain(id);
      if (res.ok) {
        setImages((prev) => prev.map((img) => ({ ...img, isMain: img.id === id })));
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFiles}
      />

      {images.length === 0 ? (
        <p className="text-sm text-muted">{emptyMessage}</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={img.id} className="group relative">
              <button
                type="button"
                onClick={() => setLightboxIndex(i)}
                aria-label="نمایش بزرگ تصویر"
                className="block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt ?? imageAlt}
                  className={`h-28 w-28 cursor-zoom-in rounded-lg border object-cover ${img.isMain ? "ring-2 ring-primary" : ""}`}
                />
              </button>
              {img.isMain && (
                <span className="absolute -top-2 -start-2 rounded-full bg-primary p-1 text-primary-foreground">
                  <Star className="size-3" fill="currentColor" />
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 rounded-b-lg bg-background/90 py-1 opacity-0 group-hover:opacity-100">
                {!img.isMain && (
                  <button
                    type="button"
                    onClick={() => handleSetMain(img.id)}
                    aria-label="انتخاب به‌عنوان تصویر اصلی"
                    className="rounded p-1 text-muted hover:text-primary"
                  >
                    <Star className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  aria-label="حذف تصویر"
                  className="rounded p-1 text-muted hover:text-danger"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={pick}
        disabled={isUploading}
        className="flex h-10 items-center gap-2 rounded-lg border border-dashed px-4 text-sm text-muted hover:border-primary hover:text-primary disabled:opacity-60"
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImageIcon className="size-4" />
        )}
        {isUploading ? "در حال بارگذاری…" : "افزودن تصویر"}
      </button>
      {!isUploading && images.length > 0 && (
        <p className="flex items-center gap-1 text-xs text-muted">
          <Upload className="size-3" />
          می‌توانید چند تصویر را هم‌زمان انتخاب کنید.
        </p>
      )}

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images.map((img) => ({ id: img.id, url: img.url, alt: img.alt }))}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
