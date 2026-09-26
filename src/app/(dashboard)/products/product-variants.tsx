"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import {
  TextField,
  TextInput,
  CheckboxField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import {
  createVariantAction,
  updateVariantAction,
  updateVariantStockAction,
} from "./actions";
import { clearFieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";
import type { ProductVariant } from "@/lib/api/backoffice/products";

/** بخش واریانت‌های محصول: فهرست ویرایش‌پذیر + فرم افزودن واریانت جدید */
export function ProductVariants({
  productId,
  basePrice,
  initial,
}: {
  productId: string;
  basePrice: number;
  initial: ProductVariant[];
}) {
  const [variants, setVariants] = useState<ProductVariant[]>(initial);

  return (
    <div className="space-y-4">
      {variants.length === 0 ? (
        <p className="text-sm text-muted">هنوز واریانتی برای این محصول ثبت نشده است.</p>
      ) : (
        <div className="space-y-3">
          {variants.map((v) => (
            <VariantRow
              key={v.id}
              productId={productId}
              basePrice={basePrice}
              variant={v}
              onUpdated={(patch) =>
                setVariants((prev) =>
                  prev.map((r) => (r.id === v.id ? { ...r, ...patch } : r)),
                )
              }
            />
          ))}
        </div>
      )}

      <NewVariantForm
        productId={productId}
        onCreated={(variant) => setVariants((prev) => [...prev, variant])}
      />
    </div>
  );
}

function VariantRow({
  productId,
  basePrice,
  variant,
  onUpdated,
}: {
  productId: string;
  basePrice: number;
  variant: ProductVariant;
  onUpdated: (patch: Partial<ProductVariant>) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [sku, setSku] = useState(variant.sku);
  const [colorName, setColorName] = useState(variant.colorName ?? "");
  const [isActive, setIsActive] = useState(variant.isActive);
  const [stockQty, setStockQty] = useState(String(variant.stockQty));
  const [priceOverride, setPriceOverride] = useState(
    variant.priceOverride != null ? String(variant.priceOverride) : "",
  );
  const [weightGrams, setWeightGrams] = useState(
    variant.weightGrams != null ? String(variant.weightGrams) : "",
  );
  const [result, setResult] = useState<ActionResult | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  const dirty =
    sku !== variant.sku ||
    colorName !== (variant.colorName ?? "") ||
    isActive !== variant.isActive ||
    stockQty !== String(variant.stockQty) ||
    priceOverride !== (variant.priceOverride != null ? String(variant.priceOverride) : "") ||
    weightGrams !== (variant.weightGrams != null ? String(variant.weightGrams) : "");

  function save() {
    setResult(null);
    startTransition(async () => {
      const metaChanged =
        sku !== variant.sku ||
        colorName !== (variant.colorName ?? "") ||
        isActive !== variant.isActive;
      const stockChanged =
        stockQty !== String(variant.stockQty) ||
        priceOverride !== (variant.priceOverride != null ? String(variant.priceOverride) : "") ||
        weightGrams !== (variant.weightGrams != null ? String(variant.weightGrams) : "");

      let ok = true;
      let message = "";
      const fieldErrors: FieldErrors = {};

      if (metaChanged) {
        const res = await updateVariantAction(productId, variant.id, {
          sku: sku.trim(),
          colorName: colorName.trim() || null,
          isActive,
        });
        if (!res.ok) {
          ok = false;
          message = res.message;
          Object.assign(fieldErrors, res.fieldErrors);
        }
      }
      if (stockChanged) {
        const res = await updateVariantStockAction(productId, variant.id, {
          stockQty: Number(stockQty) || 0,
          priceOverride: priceOverride.trim() ? Number(priceOverride) : null,
          weightGrams: weightGrams.trim() ? Number(weightGrams) : null,
        });
        if (!res.ok) {
          ok = false;
          message = message || res.message;
          Object.assign(fieldErrors, res.fieldErrors);
        }
      }

      if (ok) {
        onUpdated({
          sku: sku.trim(),
          colorName: colorName.trim() || null,
          isActive,
          stockQty: Number(stockQty) || 0,
          priceOverride: priceOverride.trim() ? Number(priceOverride) : null,
          weightGrams: weightGrams.trim() ? Number(weightGrams) : null,
        });
        setResult({ ok: true });
      } else {
        setResult({ ok: false, message, fieldErrors });
      }
    });
  }

  return (
    <div className="rounded-lg border p-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-40 space-y-1">
          <span className="block text-xs text-muted">کد کالا (SKU)</span>
          <TextInput
            aria-label="کد کالا"
            dir="ltr"
            value={sku}
            onChange={(e) => { setSku(e.target.value); clearError("sku"); }}
            aria-invalid={Boolean(errors?.sku) || undefined}
            className={errors?.sku ? "border-danger" : ""}
          />
          {errors?.sku && <p role="alert" className="text-xs text-danger">{errors.sku}</p>}
        </div>
        <div className="w-32 space-y-1">
          <span className="block text-xs text-muted">رنگ</span>
          <TextInput
            aria-label="رنگ"
            value={colorName}
            onChange={(e) => { setColorName(e.target.value); clearError("colorName"); }}
            aria-invalid={Boolean(errors?.colorName) || undefined}
            className={errors?.colorName ? "border-danger" : ""}
          />
          {errors?.colorName && <p role="alert" className="text-xs text-danger">{errors.colorName}</p>}
        </div>
        <div className="w-24 space-y-1">
          <span className="block text-xs text-muted">موجودی</span>
          <TextInput
            aria-label="موجودی"
            type="number"
            dir="ltr"
            min={0}
            value={stockQty}
            onChange={(e) => { setStockQty(e.target.value); clearError("stockQty"); }}
            aria-invalid={Boolean(errors?.stockQty) || undefined}
            className={errors?.stockQty ? "border-danger" : ""}
          />
          {errors?.stockQty && <p role="alert" className="text-xs text-danger">{errors.stockQty}</p>}
        </div>
        <div className="w-36 space-y-1">
          <span className="block text-xs text-muted">قیمت جایگزین</span>
          <TextInput
            aria-label="قیمت جایگزین"
            type="number"
            dir="ltr"
            min={0}
            placeholder={String(basePrice)}
            value={priceOverride}
            onChange={(e) => { setPriceOverride(e.target.value); clearError("priceOverride"); }}
            aria-invalid={Boolean(errors?.priceOverride) || undefined}
            className={errors?.priceOverride ? "border-danger" : ""}
          />
          {errors?.priceOverride && (
            <p role="alert" className="text-xs text-danger">{errors.priceOverride}</p>
          )}
        </div>
        <div className="w-28 space-y-1">
          <span className="block text-xs text-muted">وزن (گرم)</span>
          <TextInput
            aria-label="وزن به گرم"
            type="number"
            dir="ltr"
            min={0}
            value={weightGrams}
            onChange={(e) => { setWeightGrams(e.target.value); clearError("weightGrams"); }}
            aria-invalid={Boolean(errors?.weightGrams) || undefined}
            className={errors?.weightGrams ? "border-danger" : ""}
          />
          {errors?.weightGrams && (
            <p role="alert" className="text-xs text-danger">{errors.weightGrams}</p>
          )}
        </div>
        <CheckboxField id={`active-${variant.id}`} label="فعال" checked={isActive} onChange={setIsActive} />
        <button
          type="button"
          onClick={save}
          disabled={!dirty || isPending}
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
        >
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          ذخیره
        </button>
        {result?.ok && !dirty && <span className="text-xs text-success">ذخیره شد</span>}
      </div>
      {result && !result.ok &&
        !errors?.sku && !errors?.colorName && !errors?.stockQty && !errors?.priceOverride && !errors?.weightGrams && (
          <p role="alert" className="mt-2 text-xs text-danger">{result.message}</p>
        )}
    </div>
  );
}

function NewVariantForm({
  productId,
  onCreated,
}: {
  productId: string;
  onCreated: (variant: ProductVariant) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [sku, setSku] = useState("");
  const [colorName, setColorName] = useState("");
  const [stockQty, setStockQty] = useState("0");
  const [priceOverride, setPriceOverride] = useState("");
  const [weightGrams, setWeightGrams] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [result, setResult] = useState<ActionResult<{ id: string }> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function clearError(field: string) {
    setResult((prev) => clearFieldError(prev, field));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sku.trim()) {
      setResult(invalid({ sku: "کد کالا الزامی است." }));
      return;
    }
    setResult(null);
    startTransition(async () => {
      const res = await createVariantAction(productId, {
        sku: sku.trim(),
        colorName: colorName.trim() || null,
        stockQty: Number(stockQty) || 0,
        priceOverride: priceOverride.trim() ? Number(priceOverride) : null,
        weightGrams: weightGrams.trim() ? Number(weightGrams) : null,
        isActive,
      });
      if (res.ok && res.data) {
        onCreated({
          id: res.data.id,
          sku: sku.trim(),
          colorName: colorName.trim() || null,
          stockQty: Number(stockQty) || 0,
          priceOverride: priceOverride.trim() ? Number(priceOverride) : null,
          weightGrams: weightGrams.trim() ? Number(weightGrams) : null,
          isActive,
        });
        setSku("");
        setColorName("");
        setStockQty("0");
        setPriceOverride("");
        setWeightGrams("");
        setIsActive(true);
      }
      setResult(res);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-dashed p-3">
      <p className="flex items-center gap-1.5 text-sm font-medium">
        <Plus className="size-4" />
        افزودن واریانت جدید
      </p>
      <div className="flex flex-wrap items-start gap-3">
        <TextField
          label="کد کالا (SKU)"
          name="sku"
          dir="ltr"
          value={sku}
          onChange={setSku}
          errors={errors}
          onErrorClear={clearError}
          className="w-40"
        />
        <TextField
          label="رنگ"
          name="colorName"
          value={colorName}
          onChange={setColorName}
          errors={errors}
          onErrorClear={clearError}
          className="w-32"
        />
        <TextField
          label="موجودی اولیه"
          name="stockQty"
          type="number"
          dir="ltr"
          min={0}
          value={stockQty}
          onChange={setStockQty}
          errors={errors}
          onErrorClear={clearError}
          className="w-24"
        />
        <TextField
          label="قیمت جایگزین"
          name="priceOverride"
          type="number"
          dir="ltr"
          min={0}
          hint="خالی = قیمت پایه"
          value={priceOverride}
          onChange={setPriceOverride}
          errors={errors}
          onErrorClear={clearError}
          className="w-36"
        />
        <TextField
          label="وزن (گرم)"
          name="weightGrams"
          type="number"
          dir="ltr"
          min={0}
          value={weightGrams}
          onChange={setWeightGrams}
          errors={errors}
          onErrorClear={clearError}
          className="w-28"
        />
        <div className="pt-6">
          <CheckboxField id="new-variant-active" label="فعال" checked={isActive} onChange={setIsActive} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton pending={isPending}>افزودن واریانت</SubmitButton>
        {result?.ok && <FormMessage tone="success">افزوده شد.</FormMessage>}
        {result && !result.ok && !errors && <FormMessage tone="danger">{result.message}</FormMessage>}
      </div>
    </form>
  );
}
