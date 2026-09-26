"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { setContactMessageStatusAction } from "./actions";
import type { ContactMessageStatus } from "@/lib/api/backoffice/moderation";

/** تغییر وضعیت یک پیام تماس بین «جدید» و «رسیدگی‌شده» */
export function ContactStatusButtons({
  messageId,
  status,
}: {
  messageId: string;
  status: ContactMessageStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set(next: ContactMessageStatus) {
    setError(null);
    startTransition(async () => {
      const res = await setContactMessageStatusAction(messageId, next);
      if (!res.ok) setError(res.message);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {isPending && <Loader2 className="size-4 animate-spin text-muted" />}
      {status === "new" ? (
        <button
          type="button"
          onClick={() => set("handled")}
          disabled={isPending}
          className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs text-success hover:bg-success-surface disabled:opacity-50"
        >
          <Check className="size-3.5" />
          رسیدگی شد
        </button>
      ) : (
        <button
          type="button"
          onClick={() => set("new")}
          disabled={isPending}
          className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs text-muted hover:text-foreground disabled:opacity-50"
        >
          <RotateCcw className="size-3.5" />
          بازگرداندن به جدید
        </button>
      )}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
