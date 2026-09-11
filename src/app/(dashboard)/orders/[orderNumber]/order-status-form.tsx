"use client";

import { useState, useTransition } from "react";
import {
  SelectField,
  TextField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { setOrderStatusAction } from "../actions";
import { clearFieldError, type ActionResult } from "@/lib/forms";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/api/backoffice/order-status";

export function OrderStatusForm({
  orderNumber,
  currentStatus,
}: {
  orderNumber: string;
  currentStatus: OrderStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await setOrderStatusAction(orderNumber, status, note);
      setResult(res);
      if (res.ok) setNote("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectField
        label="وضعیت جدید"
        name="status"
        value={status}
        onChange={(v) => { setStatus(v as OrderStatus); clearError("status"); }}
        errors={errors}
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </SelectField>

      <TextField
        label="یادداشت (اختیاری)"
        name="note"
        value={note}
        onChange={setNote}
        errors={errors}
        onErrorClear={clearError}
        placeholder="مثلاً: شروع آماده‌سازی"
      />

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>ثبت وضعیت</SubmitButton>
        {result?.ok && <FormMessage tone="success">ثبت شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
