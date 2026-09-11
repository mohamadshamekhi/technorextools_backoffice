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
import { createDiscountAction, updateDiscountAction } from "./actions";
import { clearFieldError, invalid, type ActionResult } from "@/lib/forms";
import type {
  BackofficeDiscount,
  DiscountAmountType,
  DiscountKind,
} from "@/lib/api/backoffice/discounts";

const KINDS: { value: DiscountKind; label: string }[] = [
  { value: "single_product", label: "تک‌محصول" },
  { value: "multi_product", label: "چندمحصول" },
  { value: "user_specific", label: "مخصوص کاربر" },
];
const AMOUNT_TYPES: { value: DiscountAmountType; label: string }[] = [
  { value: "percent", label: "درصدی" },
  { value: "fixed", label: "مبلغ ثابت" },
];

export function DiscountForm({ discount }: { discount?: BackofficeDiscount }) {
  const router = useRouter();
  const isEdit = Boolean(discount);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [code, setCode] = useState(discount?.code ?? "");
  const [kind, setKind] = useState<DiscountKind>(
    discount?.kind ?? "multi_product",
  );
  const [amountType, setAmountType] = useState<DiscountAmountType>(
    discount?.amountType ?? "percent",
  );
  const [value, setValue] = useState(String(discount?.value ?? 0));
  const [maxPerUser, setMaxPerUser] = useState(
    discount?.maxUsagePerUser != null ? String(discount.maxUsagePerUser) : "",
  );
  const [minOrder, setMinOrder] = useState(
    discount?.minOrderAmount != null ? String(discount.minOrderAmount) : "",
  );
  const [isActive, setIsActive] = useState(discount?.isActive ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setResult(invalid({ code: "کد تخفیف الزامی است." }));
      return;
    }
    setResult(null);
    const payload = {
      code: code.trim(),
      kind,
      amountType,
      value: Number(value) || 0,
      maxUsagePerUser: maxPerUser.trim() ? Number(maxPerUser) : null,
      minOrderAmount: minOrder.trim() ? Number(minOrder) : null,
      isActive,
      targets: discount?.targets ?? [],
    };
    startTransition(async () => {
      const res = discount
        ? await updateDiscountAction(discount.id, payload)
        : await createDiscountAction(payload);
      setResult(res);
      if (res.ok && !isEdit && "data" in res && res.data) {
        router.push(`/discounts/${res.data.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="کد تخفیف"
        name="code"
        dir="ltr"
        value={code}
        onChange={setCode}
        errors={errors}
        onErrorClear={clearError}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="نوع"
          name="kind"
          value={kind}
          onChange={(v) => { setKind(v as DiscountKind); clearError("kind"); }}
          errors={errors}
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="نوع مبلغ"
          name="amountType"
          value={amountType}
          onChange={(v) => { setAmountType(v as DiscountAmountType); clearError("amountType"); }}
          errors={errors}
        >
          {AMOUNT_TYPES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={amountType === "percent" ? "درصد تخفیف" : "مبلغ تخفیف (تومان)"}
          name="value"
          type="number"
          dir="ltr"
          min={0}
          value={value}
          onChange={setValue}
          errors={errors}
          onErrorClear={clearError}
        />
        <TextField
          label="سقف استفاده هر کاربر"
          name="maxUsagePerUser"
          type="number"
          dir="ltr"
          min={0}
          hint="خالی = نامحدود"
          value={maxPerUser}
          onChange={setMaxPerUser}
          errors={errors}
          onErrorClear={clearError}
        />
      </div>

      <TextField
        label="حداقل مبلغ سفارش (تومان)"
        name="minOrderAmount"
        type="number"
        dir="ltr"
        min={0}
        value={minOrder}
        onChange={setMinOrder}
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
          {isEdit ? "ذخیره تغییرات" : "ساخت کد تخفیف"}
        </SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
