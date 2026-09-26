"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  CheckboxField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { MultiPicker } from "@/components/ui/multi-picker";
import { createSparePartAction, updateSparePartAction } from "./actions";
import { clearFieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";
import { SLUG_HINT, SLUG_INVALID_MESSAGE, SLUG_PATTERN, sanitizeSlugInput } from "@/lib/slug";
import type { BackofficeSparePart } from "@/lib/api/backoffice/spare-parts";

export type ProductOption = { id: string; title: string };

export function SparePartForm({
  part,
  products,
}: {
  part?: BackofficeSparePart;
  products: ProductOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(part);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [title, setTitle] = useState(part?.title ?? "");
  const [slug, setSlug] = useState(part?.slug ?? "");
  const [partNumber, setPartNumber] = useState(part?.partNumber ?? "");
  const [price, setPrice] = useState(part ? String(part.price) : "");
  const [stockQty, setStockQty] = useState(part ? String(part.stockQty) : "0");
  const [weight, setWeight] = useState(part?.weightGrams ? String(part.weightGrams) : "");
  const [isActive, setIsActive] = useState(part?.isActive ?? true);
  const [productIds, setProductIds] = useState<string[]>(
    part?.compatibleProducts?.map((p) => p.id) ?? [],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "عنوان قطعه الزامی است.";
    if (!slug.trim()) errs.slug = "اسلاگ الزامی است.";
    else if (!SLUG_PATTERN.test(slug.trim())) errs.slug = SLUG_INVALID_MESSAGE;
    const priceNum = Number(price);
    if (price.trim() === "" || !Number.isFinite(priceNum) || priceNum < 0) {
      errs.price = "قیمت معتبر وارد کنید.";
    }
    const stockNum = Number(stockQty);
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      errs.stockQty = "موجودی باید عدد صحیح نامنفی باشد.";
    }
    const weightNum = Number(weight);
    if (weight.trim() !== "" && (!Number.isInteger(weightNum) || weightNum <= 0)) {
      errs.weightGrams = "وزن باید عدد صحیح مثبت باشد.";
    }
    if (Object.keys(errs).length > 0) {
      setResult(invalid(errs));
      return;
    }
    setResult(null);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      ...(partNumber.trim() && { partNumber: partNumber.trim() }),
      price: priceNum,
      stockQty: stockNum,
      ...(weight.trim() && { weightGrams: weightNum }),
      isActive,
      productIds,
    };
    startTransition(async () => {
      const res = part
        ? await updateSparePartAction(part.id, payload)
        : await createSparePartAction(payload);
      setResult(res);
      if (res.ok && !isEdit && "data" in res && res.data) {
        router.push(`/spare-parts/${res.data.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="عنوان قطعه"
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
        <TextField
          label="شماره قطعه"
          name="partNumber"
          dir="ltr"
          value={partNumber}
          onChange={setPartNumber}
          errors={errors}
          onErrorClear={clearError}
        />
        <TextField
          label="قیمت (تومان)"
          name="price"
          type="number"
          min={0}
          dir="ltr"
          value={price}
          onChange={setPrice}
          errors={errors}
          onErrorClear={clearError}
        />
        <TextField
          label="موجودی"
          name="stockQty"
          type="number"
          min={0}
          dir="ltr"
          value={stockQty}
          onChange={setStockQty}
          errors={errors}
          onErrorClear={clearError}
        />
        <TextField
          label="وزن (گرم)"
          name="weightGrams"
          type="number"
          min={1}
          dir="ltr"
          value={weight}
          onChange={setWeight}
          errors={errors}
          onErrorClear={clearError}
        />
      </div>

      <div className="space-y-1">
        <span className="block text-sm font-medium">محصولات سازگار</span>
        <MultiPicker
          options={products.map((p) => ({ value: p.id, label: p.title }))}
          selected={productIds}
          onChange={(ids) => {
            setProductIds(ids);
            clearError("productIds");
          }}
          ariaLabel="افزودن محصول سازگار"
          placeholder="افزودن محصول…"
          emptyLabel="این قطعه هنوز به محصولی متصل نشده است."
        />
        {errors?.productIds && <p className="text-sm text-danger">{errors.productIds}</p>}
      </div>

      <CheckboxField id="isActive" label="فعال" checked={isActive} onChange={setIsActive} />

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>{isEdit ? "ذخیره تغییرات" : "ساخت قطعه"}</SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && <FormMessage tone="danger">{result.message}</FormMessage>}
      </div>
    </form>
  );
}
