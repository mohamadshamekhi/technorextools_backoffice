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
import { createBranchAction, updateBranchAction } from "./actions";
import { clearFieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";
import type { BackofficeBranch } from "@/lib/api/backoffice/content";

export function BranchForm({ branch }: { branch?: BackofficeBranch }) {
  const router = useRouter();
  const isEdit = Boolean(branch);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [title, setTitle] = useState(branch?.title ?? "");
  const [address, setAddress] = useState(branch?.address ?? "");
  const [phone, setPhone] = useState(branch?.phone ?? "");
  const [workingHours, setWorkingHours] = useState(branch?.workingHours ?? "");
  const [isWholesale, setIsWholesale] = useState(
    branch?.isWholesalePoint ?? false,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "عنوان شعبه الزامی است.";
    if (!address.trim()) errs.address = "آدرس الزامی است.";
    if (!phone.trim()) errs.phone = "تلفن الزامی است.";
    if (Object.keys(errs).length > 0) {
      setResult(invalid(errs));
      return;
    }
    setResult(null);
    const payload = {
      title: title.trim(),
      address: address.trim(),
      phone: phone.trim(),
      workingHours: workingHours.trim() || null,
      isWholesalePoint: isWholesale,
    };
    startTransition(async () => {
      const res = branch
        ? await updateBranchAction(branch.id, payload)
        : await createBranchAction(payload);
      setResult(res);
      if (res.ok && !isEdit && "data" in res && res.data) {
        router.push(`/branches/${res.data.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="عنوان شعبه"
        name="title"
        value={title}
        onChange={setTitle}
        errors={errors}
        onErrorClear={clearError}
      />
      <TextAreaField
        label="آدرس"
        name="address"
        rows={2}
        value={address}
        onChange={setAddress}
        errors={errors}
        onErrorClear={clearError}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="تلفن"
          name="phone"
          dir="ltr"
          value={phone}
          onChange={setPhone}
          errors={errors}
          onErrorClear={clearError}
        />
        <TextField
          label="ساعات کاری"
          name="workingHours"
          value={workingHours}
          onChange={setWorkingHours}
          errors={errors}
          onErrorClear={clearError}
        />
      </div>
      <CheckboxField
        id="isWholesale"
        label="نقطه فروش عمده"
        checked={isWholesale}
        onChange={setIsWholesale}
      />

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>
          {isEdit ? "ذخیره تغییرات" : "ساخت شعبه"}
        </SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
