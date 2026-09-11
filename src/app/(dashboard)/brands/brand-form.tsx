"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  CheckboxField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { ImageUploader } from "@/components/ui/image-uploader";
import { createBrandAction, updateBrandAction } from "./actions";
import { clearFieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";
import type { BackofficeBrand } from "@/lib/api/backoffice/brands";

export function BrandForm({ brand }: { brand?: BackofficeBrand }) {
  const router = useRouter();
  const isEdit = Boolean(brand);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [title, setTitle] = useState(brand?.title ?? "");
  const [slug, setSlug] = useState(brand?.slug ?? "");
  const [logoUrl, setLogoUrl] = useState(brand?.logoUrl ?? "");
  const [isExclusive, setIsExclusive] = useState(
    brand?.isExclusiveDistributor ?? false,
  );
  const [note, setNote] = useState(brand?.authenticityNote ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "عنوان برند الزامی است.";
    if (!slug.trim()) errs.slug = "اسلاگ الزامی است.";
    if (Object.keys(errs).length > 0) {
      setResult(invalid(errs));
      return;
    }
    setResult(null);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      logoUrl: logoUrl.trim() || null,
      isExclusiveDistributor: isExclusive,
      authenticityNote: note.trim() || null,
    };
    startTransition(async () => {
      const res = brand
        ? await updateBrandAction(brand.id, payload)
        : await createBrandAction(payload);
      setResult(res);
      if (res.ok && !isEdit && "data" in res && res.data) {
        router.push(`/brands/${res.data.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="عنوان برند"
          name="title"
          value={title}
          onChange={setTitle}
          errors={errors}
          onErrorClear={clearError}
        />
        <TextField
          label="اسلاگ"
          name="slug"
          dir="ltr"
          hint="فقط حروف لاتین و خط تیره"
          value={slug}
          onChange={setSlug}
          errors={errors}
          onErrorClear={clearError}
        />
      </div>
      <div className="space-y-1">
        <span className="block text-sm font-medium">لوگو</span>
        <ImageUploader
          value={logoUrl || null}
          onChange={(url) => {
            setLogoUrl(url ?? "");
            clearError("logoUrl");
          }}
          purpose="LOGO"
          folder="brands"
          alt={title || "لوگوی برند"}
        />
      </div>
      <CheckboxField
        id="isExclusive"
        label="نماینده انحصاری"
        checked={isExclusive}
        onChange={setIsExclusive}
      />
      <TextField
        label="یادداشت اصالت"
        name="authenticityNote"
        value={note}
        onChange={setNote}
        errors={errors}
        onErrorClear={clearError}
      />

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>
          {isEdit ? "ذخیره تغییرات" : "ساخت برند"}
        </SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
