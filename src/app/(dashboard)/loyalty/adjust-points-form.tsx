"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { adjustPointsAction } from "./actions";
import { clearFieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";

export function AdjustPointsForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(points);
    const errs: FieldErrors = {};
    if (!Number.isInteger(n) || n === 0) {
      errs.points = "امتیاز باید عدد صحیح غیرصفر باشد.";
    }
    if (note.trim().length < 2) {
      errs.note = "یادداشت الزامی است (حداقل ۲ کاراکتر) — دلیل تعدیل را بنویسید.";
    }
    if (Object.keys(errs).length > 0) {
      setResult(invalid(errs));
      return;
    }
    setResult(null);
    startTransition(async () => {
      const res = await adjustPointsAction(userId, n, note.trim());
      setResult(res);
      if (res.ok) {
        setPoints("");
        setNote("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="امتیاز"
          name="points"
          type="number"
          dir="ltr"
          hint="عدد مثبت = افزودن، عدد منفی = کسر"
          value={points}
          onChange={setPoints}
          errors={errors}
          onErrorClear={clearError}
        />
        <TextField
          label="یادداشت"
          name="note"
          value={note}
          onChange={setNote}
          errors={errors}
          onErrorClear={clearError}
        />
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>ثبت</SubmitButton>
        {result?.ok && <FormMessage tone="success">ثبت شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
