"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, ChevronDown, Plus, Trash2 } from "lucide-react";
import { TextInput } from "@/components/ui/form-controls";
import { updateVariantAction, replacePriceTiersAction } from "./actions";
import { clearFieldError, fieldError, type ActionResult } from "@/lib/forms";
import type {
  InventoryVariant,
  PriceTier,
} from "@/lib/api/backoffice/inventory";

/** یک ردیف قابل ویرایش انبار: موجودی، قیمت جایگزین و لایه‌های قیمت عمده. */
export function InventoryRow({ variant }: { variant: InventoryVariant }) {
  const [isPending, startTransition] = useTransition();
  const [stock, setStock] = useState(String(variant.stockQty));
  const [price, setPrice] = useState(
    variant.priceOverride != null ? String(variant.priceOverride) : "",
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<ActionResult | null>(null);
  const [open, setOpen] = useState(false);

  function clearError(field: string) {
    setError((prev) => clearFieldError(prev, field));
  }

  const dirty =
    stock !== String(variant.stockQty) ||
    price !==
      (variant.priceOverride != null ? String(variant.priceOverride) : "");

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateVariantAction(variant.id, {
        stockQty: Number(stock) || 0,
        priceOverride: price.trim() ? Number(price) : null,
      });
      if (res.ok) setSaved(true);
      else setError(res);
    });
  }

  return (
    <>
      <tr className="border-b last:border-0">
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-start font-medium text-primary hover:underline"
          >
            <ChevronDown
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
            {variant.productTitle}
          </button>
          <div className="ps-5 text-xs text-muted" dir="ltr">
            {variant.sku}
            {variant.colorName ? ` · ${variant.colorName}` : ""}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="w-24 space-y-1">
            <TextInput
              aria-label="موجودی"
              type="number"
              dir="ltr"
              min={0}
              value={stock}
              onChange={(e) => { setStock(e.target.value); clearError("stockQty"); }}
              aria-invalid={Boolean(fieldError(error, "stockQty")) || undefined}
              className={`w-24 ${fieldError(error, "stockQty") ? "border-danger" : ""}`}
            />
            {fieldError(error, "stockQty") && (
              <p role="alert" className="text-xs text-danger">
                {fieldError(error, "stockQty")}
              </p>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="w-36 space-y-1">
            <TextInput
              aria-label="قیمت جایگزین"
              type="number"
              dir="ltr"
              min={0}
              placeholder={String(variant.basePrice)}
              value={price}
              onChange={(e) => { setPrice(e.target.value); clearError("priceOverride"); }}
              aria-invalid={Boolean(fieldError(error, "priceOverride")) || undefined}
              className={`w-36 ${fieldError(error, "priceOverride") ? "border-danger" : ""}`}
            />
            {fieldError(error, "priceOverride") && (
              <p role="alert" className="text-xs text-danger">
                {fieldError(error, "priceOverride")}
              </p>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!dirty || isPending}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              ذخیره
            </button>
            {saved && !dirty && (
              <span className="text-xs text-success">ذخیره شد</span>
            )}
            {error && !error.ok && !fieldError(error, "stockQty") && !fieldError(error, "priceOverride") && (
              <span className="text-xs text-danger">{error.message}</span>
            )}
          </div>
        </td>
      </tr>
      {open && (
        <tr className="border-b bg-background/50 last:border-0">
          <td colSpan={4} className="px-4 py-4">
            <PriceTiersEditor
              variantId={variant.id}
              initial={variant.priceTiers}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function PriceTiersEditor({
  variantId,
  initial,
}: {
  variantId: string;
  initial: PriceTier[];
}) {
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState<PriceTier[]>(initial);
  const [result, setResult] = useState<ActionResult | null>(null);

  function update(i: number, patch: Partial<PriceTier>) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  function save() {
    setResult(null);
    const tiers = rows
      .filter((r) => r.minQty > 0 && r.unitPrice > 0)
      .sort((a, b) => a.minQty - b.minQty);
    startTransition(async () => {
      setResult(await replacePriceTiersAction(variantId, tiers));
    });
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">لایه‌های قیمت عمده</p>
        <p className="text-xs text-muted">
          برای خرید عمده، از یک تعداد مشخص به بالا قیمت واحد متفاوتی اعمال کنید؛ مثلاً از ۱۰ عدد به بالا هر واحد ۱۴٬۷۰۰٬۰۰۰ ریال.
        </p>
      </div>
      {rows.length === 0 && (
        <p className="text-xs text-muted">لایه‌ای تعریف نشده است.</p>
      )}
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-end gap-2 rounded-lg border p-2">
          <label className="flex flex-col gap-1 text-xs text-muted">
            حداقل تعداد
            <TextInput
              type="number"
              dir="ltr"
              min={1}
              value={String(row.minQty)}
              onChange={(e) => update(i, { minQty: Number(e.target.value) || 0 })}
              className="w-28"
              placeholder="از تعداد"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            قیمت واحد (ریال)
            <TextInput
              type="number"
              dir="ltr"
              min={0}
              value={String(row.unitPrice)}
              onChange={(e) =>
                update(i, { unitPrice: Number(e.target.value) || 0 })
              }
              className="w-40"
              placeholder="قیمت واحد"
            />
          </label>
          <button
            type="button"
            onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
            aria-label="حذف لایه"
            className="rounded-lg p-2 text-muted hover:bg-danger-surface hover:text-danger"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() =>
            setRows((prev) => [...prev, { minQty: 0, unitPrice: 0 }])
          }
          className="flex items-center gap-1 text-sm text-primary hover:opacity-80"
        >
          <Plus className="size-4" />
          افزودن لایه
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-border/40 disabled:opacity-50"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          ذخیره لایه‌ها
        </button>
        {result?.ok && <span className="text-sm text-success">ذخیره شد</span>}
        {result && !result.ok && (
          <span className="text-sm text-danger">
            {fieldError(result, "tiers") ?? result.message}
          </span>
        )}
      </div>
    </div>
  );
}
