"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import {
  TextField,
  TextInput,
  CheckboxField,
  SubmitButton,
  FormMessage,
} from "@/components/ui/form-controls";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select";
import {
  createBundleAction,
  updateBundleAction,
  variantFieldKey,
  type BundleSaveData,
} from "./actions";
import { clearFieldError, fieldError, invalid, type ActionResult, type FieldErrors } from "@/lib/forms";
import { SLUG_HINT, SLUG_INVALID_MESSAGE, SLUG_PATTERN, sanitizeSlugInput } from "@/lib/slug";
import type { BackofficeBundle, BundleWarning } from "@/lib/api/backoffice/bundles";
import type { InventoryVariant } from "@/lib/api/backoffice/inventory";
import { formatNumber } from "@/lib/format";

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

/** وضعیت موجودی/فعال‌بودن یک قلم پکیج */
type ItemStatusInfo = { stockQty: number; isActive: boolean; label: string };

/** چیپ موجودی/وضعیت یک واریانت در کنار قلم پکیج */
function ItemStatus({ status }: { status: ItemStatusInfo | null }) {
  if (!status) return null;
  const blocking = !status.isActive || status.stockQty <= 0;
  const label = !status.isActive
    ? "غیرفعال"
    : status.stockQty <= 0
      ? "ناموجود"
      : `موجودی: ${formatNumber(status.stockQty)}`;
  return (
    <span
      className={`shrink-0 rounded-md px-2 py-1 text-xs ${
        blocking ? "bg-warning-surface text-warning" : "bg-background text-muted"
      }`}
    >
      {label}
    </span>
  );
}

/** متن هشدار ناموجودی برای یک قلم پکیج */
function warningMessage(warning: BundleWarning): string {
  return `پکیج ذخیره شد ولی به‌دلیل ناموجودی ${warning.sku} (موجودی ${formatNumber(
    warning.stockQty,
  )} از ${formatNumber(warning.requiredQty)} مورد نیاز) در سایت نمایش داده نمی‌شود.`;
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
  // شناسه محصول و SKU (سریال) هم قابل جست‌وجو باشند، نه فقط عنوان
  const variantOptions: SearchableSelectOption[] = productGroups.flatMap((group) =>
    group.variants.map((v) => ({
      value: v.id,
      label: variantLabel(v),
      group: group.productTitle,
      searchText: `${v.sku} ${v.id} ${v.productId} ${group.productTitle}`,
    })),
  );
  function optionsForRow(currentValue: string): SearchableSelectOption[] {
    if (currentValue && !variantById.has(currentValue)) {
      return [
        { value: currentValue, label: `نامشخص — ${currentValue}`, searchText: currentValue },
        ...variantOptions,
      ];
    }
    return variantOptions;
  }
  const router = useRouter();
  const isEdit = Boolean(bundle);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult<BundleSaveData> | null>(null);
  const errors = result && !result.ok ? result.fieldErrors : undefined;
  const savedWarnings = result?.ok ? (result.data?.warnings ?? []) : [];

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

  /**
   * وضعیت یک قلم: داده‌ی تازه‌ی فهرست موجودی مقدم است؛ اگر واریانت در فهرست نبود
   * از `stockQty`/`isActive` خودِ پکیج (پاسخ بک‌اند) استفاده می‌شود.
   */
  function statusOf(variantId: string): ItemStatusInfo | null {
    const variant = variantById.get(variantId);
    if (variant) {
      return {
        stockQty: variant.stockQty,
        isActive: variant.isActive,
        label: `${variant.productTitle} — ${variantLabel(variant)}`,
      };
    }
    const item = bundle?.items.find((i) => i.variantId === variantId);
    if (item && (item.stockQty !== undefined || item.isActive !== undefined)) {
      return {
        stockQty: item.stockQty ?? 0,
        isActive: item.isActive ?? true,
        label: item.title ?? item.sku ?? variantId,
      };
    }
    return null;
  }

  /** اقلام انتخاب‌شده به‌همراه واریانت متناظر (اگر در فهرست موجود باشد) */
  const rowsWithVariant = items
    .filter((row) => row.variantId)
    .map((row) => ({ row, status: statusOf(row.variantId) }));

  /** اقلامی که مانع نمایش پکیج در سایت می‌شوند */
  const blockingItems = rowsWithVariant.filter(
    ({ status }) => status && (!status.isActive || status.stockQty <= 0),
  );

  /** با موجودی فعلی، چند بسته از این پکیج قابل فروش است (اگر بک‌اند عدد نداده باشد) */
  const computedPackagesInStock = rowsWithVariant.length
    ? Math.min(
        ...rowsWithVariant.map(({ row, status }) =>
          status ? Math.floor(status.stockQty / (Number(row.qty) || 1)) : 0,
        ),
      )
    : 0;
  const packagesInStock = bundle?.packagesInStock ?? computedPackagesInStock;

  // اگر بک‌اند `available` را بدهد همان مبناست؛ وگرنه از روی اقلام محاسبه می‌شود
  const isVisibleOnSite =
    bundle?.available ?? (isActive && rowsWithVariant.length > 0 && blockingItems.length === 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanItems = items
      .filter((i) => i.variantId.trim())
      .map((i) => ({ variantId: i.variantId.trim(), qty: Number(i.qty) || 1 }));
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "عنوان پکیج الزامی است.";
    if (!slug.trim()) errs.slug = "اسلاگ الزامی است.";
    else if (!SLUG_PATTERN.test(slug.trim())) errs.slug = SLUG_INVALID_MESSAGE;
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
      {/* وضعیت واقعی انتشار: «فعال» بودن پکیج کافی نیست، همه‌ی اقلام هم باید فعال و موجود باشند */}
      <div
        className={`flex flex-wrap items-start gap-2 rounded-xl border p-3 text-sm ${
          isVisibleOnSite
            ? "border-success bg-success-surface text-success"
            : "border-warning bg-warning-surface text-warning"
        }`}
      >
        {isVisibleOnSite ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        ) : (
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        )}
        <div className="space-y-1">
          {isVisibleOnSite ? (
            <p>
              این پکیج در سایت نمایش داده می‌شود؛ با موجودی فعلی {formatNumber(packagesInStock)}{" "}
              بسته قابل فروش است.
            </p>
          ) : (
            <>
              <p>این پکیج در سایت نمایش داده نمی‌شود.</p>
              <ul className="list-inside list-disc text-xs">
                {!isActive && <li>پکیج غیرفعال است.</li>}
                {rowsWithVariant.length === 0 && <li>هیچ قلمی برای پکیج انتخاب نشده است.</li>}
                {blockingItems.map(({ row, status }) => (
                  <li key={row.variantId}>
                    {status?.label ?? row.variantId}:{" "}
                    {status && !status.isActive ? "غیرفعال است" : "موجودی صفر دارد"}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

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
          hint={SLUG_HINT}
          value={slug}
          onChange={(v) => setSlug(sanitizeSlugInput(v))}
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
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg border p-2 ${
                fieldError(result, variantFieldKey(row.variantId))
                  ? "border-danger bg-danger-surface"
                  : ""
              }`}
            >
              <SearchableSelect
                ariaLabel="محصول / تنوع"
                placeholder="— انتخاب محصول —"
                searchPlaceholder="جست‌وجو با نام، SKU یا شناسه محصول…"
                emptyMessage="محصولی با این مشخصات یافت نشد."
                value={row.variantId}
                options={optionsForRow(row.variantId)}
                onChange={(next) => {
                  clearError("items");
                  setItems((prev) =>
                    prev.map((r, j) => (j === i ? { ...r, variantId: next } : r)),
                  );
                }}
                className="min-w-0 flex-1"
              />
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
              <ItemStatus status={statusOf(row.variantId)} />
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

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <SubmitButton pending={isPending}>
            {isEdit ? "ذخیره تغییرات" : "ساخت پکیج"}
          </SubmitButton>
          {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
          {result && !result.ok && (
            <FormMessage tone="danger">{result.message}</FormMessage>
          )}
        </div>

        {/* ذخیره انجام شده ولی پکیج به‌دلیل ناموجودی در سایت دیده نمی‌شود */}
        {savedWarnings.length > 0 && (
          <ul className="space-y-1 rounded-xl border border-warning bg-warning-surface p-3 text-xs text-warning">
            {savedWarnings.map((w) => (
              <li key={w.variantId}>{warningMessage(w)}</li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
