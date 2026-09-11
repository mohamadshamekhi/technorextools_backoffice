"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  TextArea,
  SelectInput,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { formatDateTime } from "@/lib/format";
import { replyTicketAction, setTicketStatusAction } from "./actions";
import { clearFieldError, fieldError, type ActionResult } from "@/lib/forms";
import {
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
  type TicketStatus,
} from "@/lib/api/backoffice/moderation";
import type { TicketDetail } from "@/lib/api/backoffice/tickets";

export function TicketThread({ ticket }: { ticket: TicketDetail }) {
  const router = useRouter();
  const [isReplying, startReply] = useTransition();
  const [isStatusPending, startStatus] = useTransition();
  const [body, setBody] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setResult(null);
    startReply(async () => {
      const res = await replyTicketAction(ticket.id, body.trim());
      setResult(res);
      if (res.ok) {
        setBody("");
        router.refresh();
      }
    });
  }

  function changeStatus(next: TicketStatus) {
    startStatus(async () => {
      await setTicketStatusAction(ticket.id, next);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">وضعیت:</span>
        <SelectInput
          aria-label="وضعیت تیکت"
          value={ticket.status}
          disabled={isStatusPending}
          onChange={(e) => changeStatus(e.target.value as TicketStatus)}
          className="w-48"
        >
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {TICKET_STATUS_LABELS[s]}
            </option>
          ))}
        </SelectInput>
        {isStatusPending && (
          <Loader2 className="size-4 animate-spin text-muted" />
        )}
      </div>

      <ul className="space-y-3">
        {ticket.messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-lg border p-3 text-sm ${
              m.authorType === "staff"
                ? "border-primary/40 bg-primary/5"
                : "bg-surface"
            }`}
          >
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>
                {m.authorName ??
                  (m.authorType === "staff" ? "پشتیبانی" : "مشتری")}
              </span>
              <span>{formatDateTime(m.createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap">{m.body}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={sendReply} className="space-y-1">
        <TextArea
          aria-label="متن پاسخ"
          value={body}
          onChange={(e) => { setBody(e.target.value); clearError("body"); }}
          placeholder="پاسخ خود را بنویسید…"
          aria-invalid={Boolean(fieldError(result, "body")) || undefined}
          className={fieldError(result, "body") ? "border-danger" : ""}
        />
        {fieldError(result, "body") && (
          <p role="alert" className="text-xs text-danger">
            {fieldError(result, "body")}
          </p>
        )}
        <div className="pt-2">
          <div className="flex items-center gap-3">
            <SubmitButton pending={isReplying}>ارسال پاسخ</SubmitButton>
            {result?.ok && <FormMessage tone="success">ارسال شد.</FormMessage>}
            {result && !result.ok && (
              <FormMessage tone="danger">{result.message}</FormMessage>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
