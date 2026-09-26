"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { issueWarrantyAction } from "./actions";
import { clearFieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";

export function IssueWarrantyForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [orderItemId, setOrderItemId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!orderItemId.trim()) errs.orderItemId = "شناسه ردیف سفارش الزامی است.";
    if (!serialNumber.trim()) errs.serialNumber = "شماره سریال الزامی است.";
    if (!startsAt) errs.startsAt = "تاریخ شروع الزامی است.";
    if (!endsAt) errs.endsAt = "تاریخ پایان الزامی است.";
    if (Object.keys(errs).length > 0) {
      setResult(invalid(errs));
      return;
    }
    setResult(null);
    startTransition(async () => {
      const res = await issueWarrantyAction({
        orderId,
        orderItemId: orderItemId.trim(),
        serialNumber: serialNumber.trim(),
        startsAt,
        endsAt,
      });
      setResult(res);
      if (res.ok) {
        setOrderItemId("");
        setSerialNumber("");
        setStartsAt("");
        setEndsAt("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="شناسه ردیف سفارش"
          name="orderItemId"
          dir="ltr"
          value={orderItemId}
          onChange={setOrderItemId}
          errors={errors}
          onErrorClear={clearError}
        />
        <TextField
          label="شماره سریال"
          name="serialNumber"
          dir="ltr"
          value={serialNumber}
          onChange={setSerialNumber}
          errors={errors}
          onErrorClear={clearError}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="تاریخ شروع (YYYY-MM-DD)"
          name="startsAt"
          type="date"
          dir="ltr"
          value={startsAt}
          onChange={setStartsAt}
          errors={errors}
          onErrorClear={clearError}
        />
        <TextField
          label="تاریخ پایان (YYYY-MM-DD)"
          name="endsAt"
          type="date"
          dir="ltr"
          value={endsAt}
          onChange={setEndsAt}
          errors={errors}
          onErrorClear={clearError}
        />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>صدور گارانتی</SubmitButton>
        {result?.ok && <FormMessage tone="success">صادر شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
