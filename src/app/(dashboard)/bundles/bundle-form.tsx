"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  TextField,
  TextInput,
  SelectInput,
  CheckboxField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { createBundleAction, updateBundleAction } from "./actions";
import { clearFieldError, fieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";
import type { BackofficeBundle } from "@/lib/api/backoffice/bundles";
import type { InventoryVariant } from "@/lib/api/backoffice/inventory";

type ItemRow = { variantId: string; qty: string };

/** برچسب نمایشی هر واریانت داخل دراپدان — رنگ/سایز اگر باشد، وگرنه SKU */
function variantLabel(v: InventoryVariant): string {
  return v.colorName ? `${v.colorName} — ${v.sku}` : v.sku;
}

/** واریانت‌ها را برای `<optgroup>` بر اساس محصول گروه‌بندی می‌کند (ترتیب اولین رخداد حفظ می‌شود) */
function groupByProduct(
  variants: InventoryVariant[],
): { productId: string; productTitle: string; variants: InventoryVariant[] }[] {
  const groups: { productId: string; productTitle: string; variants: InventoryVariant[] }[] = [];
  for (const v of variants) {
    const existing = groups.find((g) => g.productId === v.productId);
    if (existing) existing.variants.push(v);
    else groups.push({ productId: v.productId, productTitle: v.productTitle, variants: [v] });
  }
  return groups;
}

export function BundleForm({
  bundle,
  variants,
}: {
  bundle?: BackofficeBundle;
  variants: InventoryVariant[];
}) {
  const productGroups = groupByProduct(variants);
  const variantById = new Map(variants.map((v) => [v.id, v]));
  const router = useRouter();
  const isEdit = Boolean(bundle);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const [title, setTitle] = useState(bundle?.title ?? "");
  const [slug, setSlug] = useState(bundle?.slug ?? "");
  const [bundlePrice, setBundlePrice] = useState(
    String(bundle?.bundlePrice ?? 0),
  );
  const [isActive, setIsActive] = useState(bundle?.isActive ?? true);
  const [items, setItems] = useState<ItemRow[]>(
    bundle?.items.map((i) => ({
      variantId: i.variantId,
      qty: String(i.qty),
    })) ?? [{ variantId: "", qty: "1" }],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanItems = items
      .filter((i) => i.variantId.trim())
      .map((i) => ({ variantId: i.variantId.trim(), qty: Number(i.qty) || 1 }));
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "عنوان پکیج الزامی است.";
    if (!slug.trim()) errs.slug = "اسلاگ الزامی است.";
    if (cleanItems.length === 0) errs.items = "حداقل یک قلم پکیج الزامی است.";
    if (Object.keys(errs).length > 0) {
      setResult(invalid(errs));
      return;
    }
    setResult(null);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      bundlePrice: Number(bundlePrice) || 0,
      isActive,
      items: cleanItems,
    };
    startTransition(async () => {
      const res = bundle
        ? await updateBundleAction(bundle.id, payload)
        : await createBundleAction(payload);
      setResult(res);
      if (res.ok && !isEdit && "data" in res && res.data) {
        router.push(`/bundles/${res.data.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="عنوان پکیج"
        name="title"
        value={title}
        onChange={setTitle}
        errors={errors}
        onErrorClear={clearError}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="اسلاگ"
          name="slug"
          dir="ltr"
          value={slug}
          onChange={setSlug}
          errors={errors}
          onErrorClear={clearError}
        />
        <TextField
          label="قیمت پکیج (تومان)"
          name="bundlePrice"
          type="number"
          dir="ltr"
          min={0}
          value={bundlePrice}
          onChange={setBundlePrice}
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

      <div className="space-y-2">
        <p className="text-sm font-medium">اقلام پکیج</p>
        {fieldError(result, "items") && (
          <p role="alert" className="text-xs text-danger">
            {fieldError(result, "items")}
          </p>
        )}
        <div className="space-y-2">
          {items.map((row, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border p-2">
              <SelectInput
                aria-label="محصول / تنوع"
                value={row.variantId}
                onChange={(e) => {
                  clearError("items");
                  setItems((prev) =>
                    prev.map((r, j) =>
                      j === i ? { ...r, variantId: e.target.value } : r,
                    ),
                  );
                }}
                className="min-w-0 flex-1"
              >
                <option value="">— انتخاب محصول —</option>
                {row.variantId && !variantById.has(row.variantId) && (
                  <option value={row.variantId}>
                    نامشخص — {row.variantId}
                  </option>
                )}
                {productGroups.map((group) => (
                  <optgroup key={group.productId} label={group.productTitle}>
                    {group.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {variantLabel(v)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </SelectInput>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-xs text-muted">تعداد</span>
                <TextInput
                  aria-label="تعداد"
                  type="number"
                  dir="ltr"
                  min={1}
                  value={row.qty}
                  onChange={(e) => {
                    clearError("items");
                    setItems((prev) =>
                      prev.map((r, j) =>
                        j === i ? { ...r, qty: e.target.value } : r,
                      ),
                    );
                  }}
                  className="w-16 text-center"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  clearError("items");
                  setItems((prev) => prev.filter((_, j) => j !== i));
                }}
                aria-label="حذف قلم"
                className="shrink-0 rounded-lg p-2 text-muted hover:bg-danger-surface hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            clearError("items");
            setItems((prev) => [...prev, { variantId: "", qty: "1" }]);
          }}
          className="flex items-center gap-1 text-sm text-primary hover:opacity-80"
        >
          <Plus className="size-4" />
          افزودن قلم
        </button>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>
          {isEdit ? "ذخیره تغییرات" : "ساخت پکیج"}
        </SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
