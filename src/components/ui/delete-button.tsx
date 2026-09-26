"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { FormMessage } from "@/components/ui/form-controls";

type ActionResult = { ok: true } | { ok: false; message: string };

/**
 * دکمه‌ی حذف با تأیید دو مرحله‌ای. یک server action می‌گیرد که مورد را حذف می‌کند
 * و در صورت موفقیت به `redirectTo` هدایت می‌شود (یا `router.refresh`).
 */
export function DeleteButton({
  action,
  redirectTo,
  confirmLabel = "حذف این مورد قطعی است. مطمئن هستید؟",
  children = "حذف",
}: {
  action: () => Promise<ActionResult>;
  redirectTo?: string;
  confirmLabel?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!armed) {
      setArmed(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (res.ok) {
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } else {
        setError(res.message);
        setArmed(false);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-50 ${
          armed
            ? "border-danger bg-danger-surface text-danger"
            : "text-muted hover:text-danger"
        }`}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        {armed ? confirmLabel : children}
      </button>
      {armed && !isPending && (
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="text-sm text-muted hover:text-foreground"
        >
          انصراف
        </button>
      )}
      {error && <FormMessage tone="danger">{error}</FormMessage>}
    </div>
  );
}
