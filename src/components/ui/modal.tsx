"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * مودال عمومی: پس‌زمینه‌ی تیره، بستن با Escape/کلیک بیرون، و قفل اسکرول صفحه.
 * در موبایل از پایین باز می‌شود (شیت) و در دسکتاپ وسط صفحه.
 */
export function Modal({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-t-2xl bg-surface shadow-lg sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b p-4">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {description && <div className="mt-0.5 text-xs text-muted">{description}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer && <div className="border-t p-4">{footer}</div>}
      </div>
    </div>
  );
}
