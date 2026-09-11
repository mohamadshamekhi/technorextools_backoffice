"use client";

import { useState, useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { moderateCommentAction } from "./actions";
import type { CommentStatus } from "@/lib/api/backoffice/moderation";

export function ModerationButtons({
  commentId,
  status,
}: {
  commentId: string;
  status: CommentStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set(next: CommentStatus) {
    setError(null);
    startTransition(async () => {
      const res = await moderateCommentAction(commentId, next);
      if (!res.ok) setError(res.message);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {isPending && <Loader2 className="size-4 animate-spin text-muted" />}
      {status !== "approved" && (
        <button
          type="button"
          onClick={() => set("approved")}
          disabled={isPending}
          className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs text-success hover:bg-success-surface disabled:opacity-50"
        >
          <Check className="size-3.5" />
          تأیید
        </button>
      )}
      {status !== "rejected" && (
        <button
          type="button"
          onClick={() => set("rejected")}
          disabled={isPending}
          className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs text-danger hover:bg-danger-surface disabled:opacity-50"
        >
          <X className="size-3.5" />
          رد
        </button>
      )}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
