"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreVertical, Pencil, Eye, Trash2, Loader2 } from "lucide-react";

type ActionResult = { ok: true } | { ok: false; message: string };

/**
 * دکمه‌ی سه‌نقطه‌ی هر ردیف جدول؛ با کلیک، منویی با «نمایش جزئیات»،
 * «ویرایش» و «حذف» باز می‌شود. حذف با همان الگوی دومرحله‌ای `DeleteButton`
 * (کلیک اول: مسلح‌شدن، کلیک دوم: تأیید) و بدون بستن صفحه اجرا می‌شود.
 * هر سه گزینه اختیاری‌اند — اگر عملی برای آن دامنه معنا ندارد، پاس ندهید.
 *
 * منو با `createPortal` به `document.body` رندر می‌شود (نه داخل ردیف)؛ چون جدول‌ها
 * `overflow-x-auto` دارند، منوی absolute داخل همان کانتینر برش می‌خورد و در ردیف‌های
 * پایین جدول دیده نمی‌شد — پوزیشن با `getBoundingClientRect` دکمه محاسبه می‌شود.
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
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const MENU_WIDTH = 176; // w-44
    // اپ فقط RTL است: منو از لبه‌ی چپ دکمه آویزان می‌شود و به راست گسترش می‌یابد
    // (معادل فیزیکی همان end-0 قبلی)؛ اگر دکمه به لبه‌ی راست صفحه نزدیک بود جمع می‌شود.
    const left = Math.min(rect.left, window.innerWidth - MENU_WIDTH - 8);
    setCoords({
      top: rect.bottom + 4,
      left: Math.max(8, left),
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setArmed(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setArmed(false);
      }
    }
    function handleScrollOrResize() {
      setOpen(false);
      setArmed(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
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
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="عملیات ردیف"
        className="rounded-lg p-2 text-muted hover:bg-border/40 hover:text-foreground"
      >
        <MoreVertical className="size-4" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: coords.top, left: coords.left }}
            className="fixed z-50 w-44 overflow-hidden rounded-lg border bg-surface py-1 text-sm shadow-lg"
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
          </div>,
          document.body,
        )}
    </>
  );
}
