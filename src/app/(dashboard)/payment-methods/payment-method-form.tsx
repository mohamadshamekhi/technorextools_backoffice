"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  TextAreaField,
  CheckboxField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { createPaymentMethodAction, updatePaymentMethodAction } from "./actions";
import { clearFieldError, invalid, type ActionResult } from "@/lib/forms";
import type { PaymentMethod } from "@/lib/api/backoffice/payments";

/**
 * فرم افزودن/ویرایش روش پرداخت.
 * `code` فقط هنگام ساخت قابل تعیین است — در ویرایش غیرفعال و تغییرناپذیر است.
 */
export function PaymentMethodForm({ method }: { method?: PaymentMethod }) {
  const router = useRouter();
  const isEdit = Boolean(method);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [code, setCode] = useState(method?.code ?? "");
  const [title, setTitle] = useState(method?.title ?? "");
  const [description, setDescription] = useState(method?.description ?? "");
  const [isActive, setIsActive] = useState(method?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(String(method?.sortOrder ?? 0));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEdit && !code.trim()) {
      setResult(invalid({ code: "کد روش پرداخت الزامی است." }));
      return;
    }
    if (!title.trim()) {
      setResult(invalid({ title: "عنوان روش پرداخت الزامی است." }));
      return;
    }
    setResult(null);
    const sharedFields = {
      title: title.trim(),
      description: description.trim() || null,
      isActive,
      sortOrder: Number(sortOrder) || 0,
    };
    startTransition(async () => {
      const res = method
        ? await updatePaymentMethodAction(method.id, sharedFields)
        : await createPaymentMethodAction({ code: code.trim(), ...sharedFields });
      setResult(res);
      if (res.ok && !isEdit) router.push("/payment-methods");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="کد"
          name="code"
          dir="ltr"
          disabled={isEdit}
          hint={isEdit ? "کد پس از ساخت تغییرناپذیر است" : "شناسه‌ی یکتای انگلیسی، مثلاً online یا cash"}
          value={code}
          onChange={setCode}
          errors={errors}
          onErrorClear={clearError}
        />
        <TextField
          label="عنوان"
          name="title"
          value={title}
          onChange={setTitle}
          errors={errors}
          onErrorClear={clearError}
        />
      </div>
      <TextAreaField
        label="توضیحات"
        name="description"
        value={description}
        onChange={setDescription}
        errors={errors}
        onErrorClear={clearError}
      />
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
        label="فعال (در چک‌اوت قابل انتخاب است)"
        checked={isActive}
        onChange={setIsActive}
      />

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>
          {isEdit ? "ذخیره تغییرات" : "ساخت روش پرداخت"}
        </SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
