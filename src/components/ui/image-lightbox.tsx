"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

export type LightboxImage = { id: string; url: string; alt?: string | null };

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

/**
 * نمای تمام‌صفحه‌ی گالری تصاویر: جابه‌جایی بین تصاویر (کلید/دکمه/تصویر بندانگشتی)
 * و بزرگ‌نمایی. جهت دکمه‌های قبلی/بعدی عمداً فیزیکی است (نه منطقی) چون پیمایش
 * تصاویر برخلاف متن جهت‌دار نیست؛ طبق قرارداد RTL این پروژه، پیمایش راست‌به‌چپ
 * انجام می‌شود — دکمه‌ی «بعدی» سمت چپ صفحه و «قبلی» سمت راست.
 */
export function ImageLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: LightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const current = images[index];

  // با تغییر تصویر، بزرگ‌نمایی ریست شود — طبق الگوی React برای «هم‌گام‌سازی
  // state با تغییر یک مقدار حین رندر»، نه useEffect (rule: react-hooks/set-state-in-effect).
  const [trackedIndex, setTrackedIndex] = useState(index);
  if (index !== trackedIndex) {
    setTrackedIndex(index);
    setZoom(1);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndexChange((index + 1) % images.length);
      if (e.key === "ArrowRight") onIndexChange((index - 1 + images.length) % images.length);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [index, images.length, onClose, onIndexChange]);

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="نمایش بزرگ تصویر"
      className="fixed inset-0 z-50 flex flex-col bg-foreground/90 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3 p-3 text-primary-foreground">
        <div className="flex items-center gap-1 rounded-lg bg-background/10 p-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
            disabled={zoom <= MIN_ZOOM}
            aria-label="کوچک‌نمایی"
            className="rounded-md p-1.5 hover:bg-background/15 disabled:opacity-40"
          >
            <ZoomOut className="size-4" />
          </button>
          <span className="w-10 text-center text-xs tabular-nums" dir="ltr">
            {Math.round(zoom * 100)}٪
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
            disabled={zoom >= MAX_ZOOM}
            aria-label="بزرگ‌نمایی"
            className="rounded-md p-1.5 hover:bg-background/15 disabled:opacity-40"
          >
            <ZoomIn className="size-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="rounded-lg p-2 hover:bg-background/15"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-auto px-16 py-4">
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
            aria-label="تصویر قبلی"
            className="absolute start-3 top-1/2 -translate-y-1/2 rounded-full bg-background/10 p-2 text-primary-foreground hover:bg-background/20"
          >
            <ChevronRight className="size-6" />
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.alt ?? "تصویر"}
          style={{ transform: `scale(${zoom})` }}
          className="max-h-full max-w-full cursor-default object-contain transition-transform duration-150"
        />

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onIndexChange((index + 1) % images.length)}
            aria-label="تصویر بعدی"
            className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full bg-background/10 p-2 text-primary-foreground hover:bg-background/20"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto p-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onIndexChange(i)}
              aria-label={`تصویر ${i + 1}`}
              aria-current={i === index}
              className={`shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                i === index ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="size-14 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
