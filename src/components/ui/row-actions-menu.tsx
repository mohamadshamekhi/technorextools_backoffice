"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreVertical, Pencil, Eye, Trash2, Loader2 } from "lucide-react";

type ActionResult = { ok: true } | { ok: false; message: string };

/**
 * دکمه‌ی سه‌نقطه‌ی هر ردیف جدول؛ با کلیک، منویی با «نمایش جزئیات»،
 * «ویرایش» و «حذف» باز می‌شود. حذف با همان الگوی دومرحله‌ای `DeleteButton`
 * (کلیک اول: مسلح‌شدن، کلیک دوم: تأیید) و بدون بستن صفحه اجرا می‌شود.
 * هر سه گزینه اختیاری‌اند — اگر عملی برای آن دامنه معنا ندارد، پاس ندهید.
 */
export function RowActionsMenu({
  viewHref,
  editHref,
  onDelete,
  deleteConfirmLabel = "تأیید حذف",
}: {
  viewHref?: string;
  editHref?: string;
  onDelete?: () => Promise<ActionResult>;
  deleteConfirmLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setArmed(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setArmed(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleDeleteClick() {
    if (!onDelete) return;
    if (!armed) {
      setArmed(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await onDelete();
      if (res.ok) {
        setOpen(false);
        setArmed(false);
        router.refresh();
      } else {
        setError(res.message);
        setArmed(false);
      }
    });
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="عملیات ردیف"
        className="rounded-lg p-2 text-muted hover:bg-border/40 hover:text-foreground"
      >
        <MoreVertical className="size-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-lg border bg-surface py-1 text-sm shadow-lg"
        >
          {viewHref && (
            <Link
              href={viewHref}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-border/40"
            >
              <Eye className="size-4" />
              نمایش جزئیات
            </Link>
          )}
          {editHref && (
            <Link
              href={editHref}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-border/40"
            >
              <Pencil className="size-4" />
              ویرایش
            </Link>
          )}
          {onDelete && (
            <button
              type="button"
              role="menuitem"
              onClick={handleDeleteClick}
              disabled={isPending}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-danger hover:bg-danger-surface disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {armed ? deleteConfirmLabel : "حذف"}
            </button>
          )}
          {error && (
            <p role="alert" className="px-3 py-1.5 text-xs text-danger">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
