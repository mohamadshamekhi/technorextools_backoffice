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
import { createCategoryAction, updateCategoryAction } from "./actions";
import { clearFieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";
import type { BackofficeCategory } from "@/lib/api/backoffice/categories";

export function CategoryForm({
  category,
  parents,
}: {
  category?: BackofficeCategory;
  parents: BackofficeCategory[];
}) {
  const router = useRouter();
  const isEdit = Boolean(category);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [title, setTitle] = useState(category?.title ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [parentId, setParentId] = useState(category?.parentId ?? "");
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "عنوان دسته الزامی است.";
    if (!slug.trim()) errs.slug = "اسلاگ الزامی است.";
    if (Object.keys(errs).length > 0) {
      setResult(invalid(errs));
      return;
    }
    setResult(null);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      parentId: parentId || null,
      sortOrder: Number(sortOrder) || 0,
      isActive,
    };
    startTransition(async () => {
      const res = category
        ? await updateCategoryAction(category.id, payload)
        : await createCategoryAction(payload);
      setResult(res);
      if (res.ok && !isEdit && "data" in res && res.data) {
        router.push(`/categories/${res.data.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="عنوان دسته"
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
          value={slug}
          onChange={setSlug}
          errors={errors}
          onErrorClear={clearError}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="دسته والد"
          name="parentId"
          value={parentId}
          onChange={setParentId}
          errors={errors}
          onErrorClear={clearError}
        >
          <option value="">— بدون والد (سطح اول) —</option>
          {parents
            .filter((p) => p.id !== category?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
        </SelectField>
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
      </div>
      <CheckboxField
        id="isActive"
        label="فعال"
        checked={isActive}
        onChange={setIsActive}
      />

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>
          {isEdit ? "ذخیره تغییرات" : "ساخت دسته"}
        </SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
