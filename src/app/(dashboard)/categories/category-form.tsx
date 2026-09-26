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
import { ImageUploader, uploadOwnedImage } from "@/components/ui/image-uploader";
import { createCategoryAction, updateCategoryAction } from "./actions";
import { clearFieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";
import { SLUG_HINT, SLUG_INVALID_MESSAGE, SLUG_PATTERN, sanitizeSlugInput } from "@/lib/slug";
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
  const [imageUrl, setImageUrl] = useState(category?.imageUrl ?? "");
  // در حالت ساخت هنوز شناسه‌ای نیست؛ فایل نگه داشته می‌شود تا بعد از ساخت دسته آپلود شود
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "عنوان دسته الزامی است.";
    if (!slug.trim()) errs.slug = "اسلاگ الزامی است.";
    else if (!SLUG_PATTERN.test(slug.trim())) errs.slug = SLUG_INVALID_MESSAGE;
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
      imageUrl: imageUrl.trim() || null,
    };
    startTransition(async () => {
      if (category) {
        setResult(await updateCategoryAction(category.id, payload));
        return;
      }

      // دسته باید اول ساخته شود تا تصویر با ownerId=CATEGORY آپلود شود
      let categoryId = createdId;
      if (!categoryId) {
        const res = await createCategoryAction(payload);
        if (!res.ok) {
          setResult(res);
          return;
        }
        categoryId = res.data?.id ?? null;
        setCreatedId(categoryId);
      } else {
        const res = await updateCategoryAction(categoryId, payload);
        if (!res.ok) {
          setResult(res);
          return;
        }
      }
      if (!categoryId) return;

      if (imageFile) {
        const up = await uploadOwnedImage(imageFile, {
          purpose: "LOGO",
          folder: "categories",
          alt: title.trim() || "تصویر دسته",
          ownerType: "CATEGORY",
          ownerId: categoryId,
        });
        if (!up.ok) {
          setResult({
            ok: false,
            message: `دسته ثبت شد اما بارگذاری تصویر ناموفق بود: ${up.message}`,
          });
          return;
        }
        setImageFile(null);
        setImageUrl(up.url);
        // آدرس تصویر باید روی خود دسته هم ذخیره شود (بدنه هنوز imageUrl می‌گیرد)
        const patched = await updateCategoryAction(categoryId, { imageUrl: up.url });
        if (!patched.ok) {
          setResult(patched);
          return;
        }
      }

      setResult({ ok: true });
      router.push(`/categories/${categoryId}`);
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
          hint={SLUG_HINT}
          value={slug}
          onChange={(v) => setSlug(sanitizeSlugInput(v))}
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
      <div className="space-y-1">
        <span className="block text-sm font-medium">تصویر دسته</span>
        <ImageUploader
          value={imageUrl || null}
          onChange={(url) => {
            setImageUrl(url ?? "");
            clearError("imageUrl");
          }}
          onFileSelect={setImageFile}
          owner={
            category
              ? { type: "CATEGORY", id: category.id }
              : createdId
                ? { type: "CATEGORY", id: createdId }
                : null
          }
          purpose="LOGO"
          folder="categories"
          alt={title || "تصویر دسته"}
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
