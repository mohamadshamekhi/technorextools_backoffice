"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import {
  Field,
  TextInput,
  FormMessage,
} from "@/components/ui/form-controls";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { RefOption } from "../product-form";
import {
  bulkPriceUpdateAction,
  previewBulkPriceScopeAction,
  searchProductsForBulkPriceAction,
  type BulkPriceScopeInput,
} from "../actions";
import type { BulkPriceUpdateResult } from "@/lib/api/backoffice/products";

type ScopeType = "brand" | "category" | "products";
type Mode = "percent" | "fixed";
type Direction = "increase" | "decrease";

const SEGMENT_BASE =
  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors";
const SEGMENT_ACTIVE = "bg-primary text-primary-foreground";
const SEGMENT_INACTIVE = "border text-muted hover:text-foreground";

export function BulkPriceUpdateForm({
  brands,
  categories,
}: {
  brands: RefOption[];
  categories: RefOption[];
}) {
  const router = useRouter();
  const [scopeType, setScopeType] = useState<ScopeType>("brand");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<RefOption[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState<RefOption[]>([]);
  const [searching, setSearching] = useState(false);

  const [mode, setMode] = useState<Mode>("percent");
  const [direction, setDirection] = useState<Direction>("increase");
  const [value, setValue] = useState("");

  const [confirming, setConfirming] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [message, setMessage] = useState<
    { tone: "success" | "danger"; text: string } | null
  >(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  // جست‌وجوی محصول برای انتخاب دستی
  useEffect(() => {
    if (scopeType !== "products" || !productQuery.trim()) return;
    let active = true;
    const timer = setTimeout(() => {
      searchProductsForBulkPriceAction(productQuery.trim()).then((res) => {
        if (!active) return;
        setSearching(false);
        if (res.ok && res.data) {
          setProductResults(res.data.filter((p) => !selectedProducts.some((s) => s.id === p.id)));
        }
      });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productQuery, scopeType]);

  const visibleProductResults = productQuery.trim() && scopeType === "products" ? productResults : [];

  const scope: BulkPriceScopeInput | null = useMemo(() => {
    if (scopeType === "brand") return brandId ? { type: "brand", brandId } : null;
    if (scopeType === "category")
      return categoryId ? { type: "category", categoryId } : null;
    return selectedProducts.length
      ? { type: "products", productIds: selectedProducts.map((p) => p.id) }
      : null;
  }, [scopeType, brandId, categoryId, selectedProducts]);

  const numericValue = Number(value);
  const valueValid = value.trim() !== "" && Number.isFinite(numericValue) && numericValue > 0;
  const percentDecreaseTooLarge = mode === "percent" && direction === "decrease" && numericValue > 100;
  const canSubmit = scope !== null && valueValid && !percentDecreaseTooLarge;

  function scopeLabel(): string {
    if (scopeType === "brand") return brands.find((b) => b.id === brandId)?.title ?? "";
    if (scopeType === "category") return categories.find((c) => c.id === categoryId)?.title ?? "";
    return `${selectedProducts.length} محصول انتخاب‌شده`;
  }

  async function handleReview() {
    if (!scope) return;
    setMessage(null);
    setFieldError(undefined);
    startTransition(async () => {
      const res = await previewBulkPriceScopeAction(scope);
      if (!res.ok || !res.data) {
        setMessage({ tone: "danger", text: !res.ok ? res.message : "خطای غیرمنتظره." });
        return;
      }
      if (res.data.count === 0) {
        setMessage({ tone: "danger", text: "هیچ محصولی با این دامنه یافت نشد." });
        return;
      }
      setPreviewCount(res.data.count);
      setConfirming(true);
    });
  }

  function handleConfirm() {
    if (!scope) return;
    startTransition(async () => {
      const res = await bulkPriceUpdateAction(scope, mode, direction, numericValue);
      if (!res.ok || !res.data) {
        setConfirming(false);
        setFieldError(!res.ok ? res.fieldErrors?.value : undefined);
        setMessage({ tone: "danger", text: !res.ok ? res.message : "خطای غیرمنتظره." });
        return;
      }
      setConfirming(false);
      setMessage({
        tone: "success",
        text: successMessage(res.data),
      });
      router.refresh();
    });
  }

  function successMessage(data: BulkPriceUpdateResult): string {
    return `قیمت ${toPersianDigits(data.matchedProducts)} محصول به‌روزرسانی شد؛ از این میان قیمت ${toPersianDigits(
      data.updatedVariants,
    )} واریانت که override داشتند نیز اصلاح شد.`;
  }

  function confirmSummary(): string {
    const dirLabel = direction === "increase" ? "افزایش" : "کاهش";
    const valueLabel = mode === "percent" ? `${toPersianDigits(numericValue)}٪` : `${toPersianDigits(numericValue)} تومان`;
    return `قیمت ${toPersianDigits(previewCount ?? 0)} محصول (${scopeLabel()}) به‌اندازه‌ی ${valueLabel} ${dirLabel} پیدا می‌کند. این عملیات قابل بازگشت نیست.`;
  }

  return (
    <div className="space-y-6">
      {/* دامنه */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">دامنه‌ی اعمال تغییر</legend>
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {(
            [
              ["brand", "بر اساس برند"],
              ["category", "بر اساس دسته‌بندی"],
              ["products", "انتخاب دستی محصولات"],
            ] as [ScopeType, string][]
          ).map(([type, label]) => (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={scopeType === type}
              onClick={() => {
                setScopeType(type);
                setConfirming(false);
                setMessage(null);
              }}
              className={`${SEGMENT_BASE} ${scopeType === type ? SEGMENT_ACTIVE : SEGMENT_INACTIVE}`}
            >
              {label}
            </button>
          ))}
        </div>

        {scopeType === "brand" && (
          <SearchableSelect
            ariaLabel="برند"
            placeholder="یک برند انتخاب کنید"
            options={brands.map((b) => ({ value: b.id, label: b.title }))}
            value={brandId}
            onChange={setBrandId}
          />
        )}

        {scopeType === "category" && (
          <SearchableSelect
            ariaLabel="دسته‌بندی"
            placeholder="یک دسته‌بندی انتخاب کنید"
            options={categories.map((c) => ({ value: c.id, label: c.title }))}
            value={categoryId}
            onChange={setCategoryId}
          />
        )}

        {scopeType === "products" && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <TextInput
                value={productQuery}
                onChange={(e) => {
                  setProductQuery(e.target.value);
                  setSearching(e.target.value.trim().length > 0);
                }}
                placeholder="جست‌وجوی نام محصول…"
                className="pe-9"
              />
            </div>
            {searching && <p className="text-xs text-muted">در حال جست‌وجو…</p>}
            {visibleProductResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-lg border">
                {visibleProductResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProducts((cur) => [...cur, p]);
                      setProductQuery("");
                      setProductResults([]);
                    }}
                    className="flex w-full items-center px-3 py-2 text-start text-sm hover:bg-border/40"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            )}
            {selectedProducts.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {selectedProducts.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-1.5 rounded-full border bg-surface-muted px-3 py-1 text-xs"
                  >
                    {p.title}
                    <button
                      type="button"
                      aria-label={`حذف ${p.title} از انتخاب`}
                      onClick={() =>
                        setSelectedProducts((cur) => cur.filter((s) => s.id !== p.id))
                      }
                      className="text-muted hover:text-danger"
                    >
                      <X className="size-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </fieldset>

      {/* نوع و جهت تغییر */}
      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">نوع تغییر</legend>
          <div role="radiogroup" className="flex gap-2">
            <button
              type="button"
              role="radio"
              aria-checked={mode === "percent"}
              onClick={() => setMode("percent")}
              className={`${SEGMENT_BASE} ${mode === "percent" ? SEGMENT_ACTIVE : SEGMENT_INACTIVE}`}
            >
              درصدی
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mode === "fixed"}
              onClick={() => setMode("fixed")}
              className={`${SEGMENT_BASE} ${mode === "fixed" ? SEGMENT_ACTIVE : SEGMENT_INACTIVE}`}
            >
              مبلغ ثابت (تومان)
            </button>
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">جهت تغییر</legend>
          <div role="radiogroup" className="flex gap-2">
            <button
              type="button"
              role="radio"
              aria-checked={direction === "increase"}
              onClick={() => setDirection("increase")}
              className={`${SEGMENT_BASE} ${direction === "increase" ? SEGMENT_ACTIVE : SEGMENT_INACTIVE}`}
            >
              افزایش
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={direction === "decrease"}
              onClick={() => setDirection("decrease")}
              className={`${SEGMENT_BASE} ${direction === "decrease" ? SEGMENT_ACTIVE : SEGMENT_INACTIVE}`}
            >
              کاهش
            </button>
          </div>
        </fieldset>
      </div>

      <Field
        label={mode === "percent" ? "درصد تغییر" : "مبلغ تغییر (تومان)"}
        htmlFor="bulk-value"
        error={fieldError}
        hint={
          mode === "percent" && direction === "decrease"
            ? "کاهش درصدی بیشتر از ۱۰۰ ممکن نیست."
            : undefined
        }
      >
        <TextInput
          id="bulk-value"
          dir="ltr"
          inputMode="decimal"
          type="number"
          min={0}
          max={mode === "percent" && direction === "decrease" ? 100 : undefined}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setFieldError(undefined);
          }}
          placeholder={mode === "percent" ? "مثلاً 20" : "مثلاً 200000"}
        />
      </Field>
      {percentDecreaseTooLarge && (
        <FormMessage tone="danger">درصد کاهش نمی‌تواند بیشتر از ۱۰۰ باشد.</FormMessage>
      )}

      {message && <FormMessage tone={message.tone}>{message.text}</FormMessage>}

      {!confirming ? (
        <button
          type="button"
          disabled={!canSubmit || isPending}
          onClick={handleReview}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          بررسی و ادامه
        </button>
      ) : (
        <div className="space-y-3 rounded-lg border bg-warning-surface p-4">
          <p className="text-sm text-warning">{confirmSummary()}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={handleConfirm}
              className="flex items-center gap-2 rounded-lg border border-danger bg-danger-surface px-4 py-2 text-sm font-medium text-danger hover:opacity-90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              تأیید و اعمال تغییر قیمت
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setConfirming(false)}
              className="rounded-lg border px-4 py-2 text-sm text-muted hover:text-foreground"
            >
              انصراف
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function toPersianDigits(n: number): string {
  const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/[0-9]/g, (d) => digits[Number(d)]);
}
