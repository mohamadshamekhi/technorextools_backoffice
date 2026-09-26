"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  SelectField,
  CheckboxField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { createShippingAction, updateShippingAction } from "./actions";
import { clearFieldError, invalid, type ActionResult } from "@/lib/forms";
import type {
  ShippingCostType,
  ShippingMethod,
} from "@/lib/api/backoffice/shipping";

const COST_TYPES: { value: ShippingCostType; label: string }[] = [
  { value: "flat", label: "هزینه ثابت" },
  { value: "by_weight", label: "بر اساس وزن" },
];

export function ShippingForm({ method }: { method?: ShippingMethod }) {
  const router = useRouter();
  const isEdit = Boolean(method);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [title, setTitle] = useState(method?.title ?? "");
  const [costType, setCostType] = useState<ShippingCostType>(
    method?.costType ?? "flat",
  );
  const [cost, setCost] = useState(String(method?.cost ?? 0));
  const [freeOver, setFreeOver] = useState(
    method?.freeOverAmount != null ? String(method.freeOverAmount) : "",
  );
  const [isActive, setIsActive] = useState(method?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(String(method?.sortOrder ?? 0));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setResult(invalid({ title: "عنوان روش ارسال الزامی است." }));
      return;
    }
    setResult(null);
    const payload = {
      title: title.trim(),
      costType,
      cost: Number(cost) || 0,
      freeOverAmount: freeOver.trim() ? Number(freeOver) : null,
      isActive,
      sortOrder: Number(sortOrder) || 0,
    };
    startTransition(async () => {
      const res = method
        ? await updateShippingAction(method.id, payload)
        : await createShippingAction(payload);
      setResult(res);
      if (res.ok && !isEdit) router.push("/shipping");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="عنوان"
          name="title"
          value={title}
          onChange={setTitle}
          errors={errors}
          onErrorClear={clearError}
        />
        <SelectField
          label="نوع هزینه"
          name="costType"
          value={costType}
          onChange={(v) => { setCostType(v as ShippingCostType); clearError("costType"); }}
          errors={errors}
        >
          {COST_TYPES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="هزینه (تومان)"
          name="cost"
          type="number"
          dir="ltr"
          min={0}
          hint="برای ارسال رایگان، هزینه را صفر بگذارید"
          value={cost}
          onChange={setCost}
          errors={errors}
          onErrorClear={clearError}
        />
        <TextField
          label="ارسال رایگان بالای مبلغ (تومان)"
          name="freeOverAmount"
          type="number"
          dir="ltr"
          min={0}
          hint="خالی = بدون آستانه"
          value={freeOver}
          onChange={setFreeOver}
          errors={errors}
          onErrorClear={clearError}
        />
      </div>
      <TextField
        label="ترتیب نمایش"
        name="sortOrder"
        type="number"
        dir="ltr"
        value={sortOrder}
        onChange={setSortOrder}
        errors={errors}
        onErrorClear={clearError}
      />
      <CheckboxField
        id="isActive"
        label="فعال"
        checked={isActive}
        onChange={setIsActive}
      />

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>
          {isEdit ? "ذخیره تغییرات" : "ساخت روش ارسال"}
        </SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
