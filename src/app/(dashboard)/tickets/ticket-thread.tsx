"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Paperclip, X } from "lucide-react";
import {
  TextArea,
  SelectInput,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { formatDateTime } from "@/lib/format";
import { uploadAttachmentAction } from "@/lib/media-actions";
import { replyTicketAction, setTicketStatusAction } from "./actions";
import { clearFieldError, fieldError, type ActionResult } from "@/lib/forms";
import {
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
  type TicketStatus,
} from "@/lib/api/backoffice/moderation";
import type {
  MediaAttachment,
  TicketDetail,
} from "@/lib/api/backoffice/tickets";

/** سقف پیوست هر پیام در بک‌اند */
const MAX_ATTACHMENTS = 5;

/** فایل آپلودشده‌ای که هنوز به پیامی چسبیده نشده است */
type PendingAttachment = { id: string; url: string; name: string };

export function TicketThread({ ticket }: { ticket: TicketDetail }) {
  const router = useRouter();
  const [isReplying, startReply] = useTransition();
  const [isStatusPending, startStatus] = useTransition();
  const [body, setBody] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [isUploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  function pickFiles() {
    fileRef.current?.click();
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // اجازه‌ی انتخاب دوباره‌ی همان فایل
    if (picked.length === 0) return;
    setUploadError(null);

    const room = MAX_ATTACHMENTS - attachments.length;
    if (room <= 0) {
      setUploadError(`حداکثر ${MAX_ATTACHMENTS} پیوست برای هر پیام مجاز است.`);
      return;
    }
    const files = picked.slice(0, room);
    if (picked.length > room) {
      setUploadError(`فقط ${room} فایل دیگر می‌توانید پیوست کنید.`);
    }

    startUpload(async () => {
      for (const file of files) {
        const form = new FormData();
        form.set("file", file);
        const res = await uploadAttachmentAction(form);
        if (res.ok) {
          setAttachments((prev) => [
            ...prev,
            { id: res.id, url: res.url, name: res.name },
          ]);
        } else {
          setUploadError(res.message);
          break;
        }
      }
    });
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setResult(null);
    startReply(async () => {
      const res = await replyTicketAction(
        ticket.id,
        body.trim(),
        attachments.map((a) => a.id),
      );
      setResult(res);
      if (res.ok) {
        setBody("");
        setAttachments([]);
        setUploadError(null);
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
            <AttachmentList items={m.attachments} />
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
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={handleFiles}
        />
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={pickFiles}
            disabled={isUploading || attachments.length >= MAX_ATTACHMENTS}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-muted hover:border-primary hover:text-primary disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Paperclip className="size-4" />
            )}
            افزودن پیوست
          </button>
          <span className="text-xs text-muted">
            حداکثر {MAX_ATTACHMENTS} فایل
          </span>
        </div>

        {attachments.length > 0 && (
          <ul className="flex flex-wrap gap-2 pt-1">
            {attachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-1.5 rounded-lg border bg-surface px-2 py-1 text-xs"
              >
                <Paperclip className="size-3.5 text-muted" />
                <span className="max-w-40 truncate">{a.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(a.id)}
                  aria-label={`حذف پیوست ${a.name}`}
                  className="text-muted hover:text-danger"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {uploadError && (
          <p role="alert" className="text-xs text-danger">
            {uploadError}
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

/** فهرست پیوست‌های یک پیام؛ تصاویر پیش‌نمایش می‌شوند و بقیه لینک دانلود می‌گیرند. */
function AttachmentList({ items }: { items: MediaAttachment[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {items.map((a) => (
        <li key={a.id}>
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border bg-surface px-2 py-1 text-xs hover:border-primary"
          >
            {a.kind === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.url}
                alt={a.originalName ?? "پیوست"}
                className="size-8 rounded border object-cover"
              />
            ) : (
              <Paperclip className="size-3.5 text-muted" />
            )}
            <span className="max-w-40 truncate">
              {a.originalName ?? "پیوست"}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
