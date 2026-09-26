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
import { RichTextField } from "@/components/ui/rich-text-editor";
import { createProductAction, updateProductAction } from "./actions";
import { clearFieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";
import { SLUG_HINT, SLUG_INVALID_MESSAGE, SLUG_PATTERN, sanitizeSlugInput } from "@/lib/slug";
import type { BackofficeProduct } from "@/lib/api/backoffice/products";

/** گزینه‌های انتخاب برند/دسته — از سرور پاس داده می‌شود */
export type RefOption = { id: string; title: string };

export function ProductForm({
  product,
  brands,
  categories,
}: {
  product?: BackofficeProduct;
  brands: RefOption[];
  categories: RefOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.category?.id ?? "");
  const [brandId, setBrandId] = useState(product?.brand?.id ?? "");
  const [shortDesc, setShortDesc] = useState(product?.shortDesc ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [basePrice, setBasePrice] = useState(String(product?.basePrice ?? ""));
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isAmazingDeal, setIsAmazingDeal] = useState(
    product?.isAmazingDeal ?? false,
  );
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(basePrice);
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "عنوان محصول الزامی است.";
    if (!slug.trim()) errs.slug = "اسلاگ الزامی است.";
    else if (!SLUG_PATTERN.test(slug.trim())) errs.slug = SLUG_INVALID_MESSAGE;
    if (!categoryId) errs.categoryId = "انتخاب دسته‌بندی الزامی است.";
    if (!Number.isFinite(price) || price < 0) {
      errs.basePrice = "قیمت پایه نامعتبر است.";
    }
    if (Object.keys(errs).length > 0) {
      setResult(invalid(errs));
      return;
    }
    setResult(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      categoryId,
      brandId: brandId || null,
      shortDesc: shortDesc.trim() || null,
      description: description.trim() || null,
      basePrice: price,
      isActive,
      isAmazingDeal,
      isFeatured,
    };

    startTransition(async () => {
      const res = product
        ? await updateProductAction(product.id, payload)
        : await createProductAction(payload);
      setResult(res);
      if (res.ok && !isEdit && "data" in res && res.data) {
        router.push(`/products/${res.data.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="عنوان محصول"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="دسته‌بندی"
          name="categoryId"
          value={categoryId}
          onChange={setCategoryId}
          errors={errors}
          onErrorClear={clearError}
        >
          <option value="">— انتخاب کنید —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="برند"
          name="brandId"
          value={brandId}
          onChange={setBrandId}
          errors={errors}
          onErrorClear={clearError}
        >
          <option value="">— بدون برند —</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </SelectField>
      </div>

      <TextField
        label="توضیح کوتاه"
        name="shortDesc"
        value={shortDesc}
        onChange={setShortDesc}
        errors={errors}
        onErrorClear={clearError}
      />

      <RichTextField
        label="توضیحات کامل"
        name="description"
        value={description}
        onChange={setDescription}
        errors={errors}
        onErrorClear={clearError}
      />

      <TextField
        label="قیمت پایه (تومان)"
        name="basePrice"
        type="number"
        dir="ltr"
        min={0}
        value={basePrice}
        onChange={setBasePrice}
        errors={errors}
        onErrorClear={clearError}
      />

      <CheckboxField
        id="isActive"
        label="محصول فعال است"
        checked={isActive}
        onChange={setIsActive}
      />
      <CheckboxField
        id="isAmazingDeal"
        label="پیشنهاد شگفت‌انگیز"
        checked={isAmazingDeal}
        onChange={setIsAmazingDeal}
      />
      <CheckboxField
        id="isFeatured"
        label="نمایش در هیرو (محصول ویژه)"
        checked={isFeatured}
        onChange={setIsFeatured}
      />

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending} />
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
