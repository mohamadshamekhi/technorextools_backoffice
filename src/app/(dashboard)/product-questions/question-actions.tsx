"use client";

import { useState, useTransition } from "react";
import { Loader2, Send, X } from "lucide-react";
import { TextArea } from "@/components/ui/form-controls";
import {
  answerProductQuestionAction,
  setProductQuestionStatusAction,
} from "./actions";
import type { ProductQuestionStatus } from "@/lib/api/backoffice/moderation";

/**
 * پاسخ‌دادن/رد کردن یک پرسش محصول. ثبت پاسخ همان لحظه پرسش را منتشر می‌کند،
 * بنابراین دکمه‌ی جداگانه‌ای برای «تأیید» لازم نیست.
 */
export function QuestionActions({
  questionId,
  status,
  initialAnswer,
}: {
  questionId: string;
  status: ProductQuestionStatus;
  initialAnswer: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [answer, setAnswer] = useState(initialAnswer ?? "");
  const [error, setError] = useState<string | null>(null);

  function submitAnswer() {
    setError(null);
    startTransition(async () => {
      const res = await answerProductQuestionAction(questionId, answer);
      if (!res.ok) setError(res.message);
    });
  }

  function reject() {
    setError(null);
    startTransition(async () => {
      const res = await setProductQuestionStatusAction(questionId, "rejected");
      if (!res.ok) setError(res.message);
    });
  }

  return (
    <div className="min-w-56 space-y-2">
      <TextArea
        rows={3}
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          setError(null);
        }}
        aria-label="متن پاسخ به پرسش"
        placeholder="پاسخ شما…"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={submitAnswer}
          disabled={isPending || !answer.trim()}
          className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs text-success hover:bg-success-surface disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Send className="size-3.5" />
          )}
          ثبت پاسخ و انتشار
        </button>
        {status !== "rejected" && (
          <button
            type="button"
            onClick={reject}
            disabled={isPending}
            className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs text-danger hover:bg-danger-surface disabled:opacity-50"
          >
            <X className="size-3.5" />
            رد پرسش
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
