"use client";

import { useState, useTransition } from "react";
import { Crosshair, Eraser, Plus, X } from "lucide-react";
import { TextInput, SubmitButton, FormMessage } from "@/components/ui/form-controls";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { replaceProductPartsAction } from "./actions";
import type { ActionResult } from "@/lib/forms";
import type { ProductPart } from "@/lib/api/backoffice/products";
import type { BackofficeSparePart } from "@/lib/api/backoffice/spare-parts";

/** حداکثر تعداد قطعه در هر محصول (محدودیت بک‌اند) */
const MAX_PARTS = 300;

/** ردیف محلی فرم؛ مقادیر عددی به‌صورت رشته نگه‌داری می‌شوند تا تایپ‌کردن روان بماند */
type PartRow = {
  /** کلید پایدار ری‌اکت — به بک‌اند فرستاده نمی‌شود */
  key: string;
  number: string;
  /** شناسه‌ی قطعه‌ی یدکی انتخاب‌شده؛ خالی یعنی هنوز انتخاب نشده */
  sparePartId: string;
  name: string;
  code: string;
  sellable: boolean;
  x: string;
  y: string;
};

let rowSeq = 0;
function newKey(): string {
  rowSeq += 1;
  return `part-${rowSeq}`;
}

/** درصد را به دو رقم اعشار گرد و در بازه‌ی ۰ تا ۱۰۰ محدود می‌کند */
function clampPercent(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)) * 100) / 100;
}

/** ردیف ذخیره‌شده را به قطعه‌ی یدکی متناظر (بر اساس شماره‌ی قطعه یا عنوان) وصل می‌کند */
function toRow(part: ProductPart, catalog: BackofficeSparePart[]): PartRow {
  const matched = catalog.find(
    (item) =>
      (part.code && item.partNumber === part.code) || (!part.code && item.title === part.name),
  );
  return {
    key: newKey(),
    number: String(part.number),
    sparePartId: matched?.id ?? "",
    name: part.name,
    code: part.code,
    sellable: part.sellable ?? false,
    x: part.hotspot ? String(part.hotspot.x) : "",
    y: part.hotspot ? String(part.hotspot.y) : "",
  };
}

/**
 * قطعات نقشه‌ی انفجاری محصول — با `PUT /backoffice/products/{id}/parts` کل لیست
 * جایگزین می‌شود (لیست خالی یعنی حذف همه). جانمایی هر قطعه روی تصویر با کلیک انجام
 * می‌شود، ولی ورودی عددی x/y هم می‌ماند تا کار با صفحه‌کلید ممکن باشد.
 */
export function ProductParts({
  productId,
  initialParts,
  explodedViewUrl,
  catalog = [],
}: {
  productId: string;
  initialParts: ProductPart[];
  explodedViewUrl: string | null;
  /** فهرست قطعات یدکی ثبت‌شده — برای انتخاب نام/کد به‌جای تایپ دستی */
  catalog?: BackofficeSparePart[];
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [rows, setRows] = useState<PartRow[]>(() =>
    initialParts.map((part) => toRow(part, catalog)),
  );
  /** کلید ردیفی که منتظر کلیک روی تصویر است؛ null یعنی حالت انتخاب خاموش است */
  const [pickingKey, setPickingKey] = useState<string | null>(null);

  const pickingRow = rows.find((row) => row.key === pickingKey) ?? null;
  const placedCount = rows.filter((row) => row.x !== "" && row.y !== "").length;

  /** گزینه‌های انتخاب از فهرست قطعات یدکی (جست‌وجو روی عنوان و شماره‌ی قطعه) */
  const catalogOptions = catalog.map((part) => ({
    value: part.id,
    label: part.partNumber ? `${part.title} — ${part.partNumber}` : part.title,
    searchText: part.partNumber ?? undefined,
  }));

  function nextNumber(list: PartRow[]): number {
    return list.reduce((max, row) => Math.max(max, Number(row.number) || 0), 0) + 1;
  }

  /** پرکردن نام و کد یک ردیف از روی قطعه‌ی انتخاب‌شده در فهرست */
  function pickFromCatalog(key: string, sparePartId: string) {
    const part = catalog.find((item) => item.id === sparePartId);
    if (!part) return;
    patchRow(key, {
      sparePartId: part.id,
      name: part.title,
      code: part.partNumber ?? "",
      sellable: true,
    });
  }

  /** افزودن ردیف تازه از روی یک قطعه‌ی فهرست */
  function addFromCatalog(sparePartId: string) {
    const part = catalog.find((item) => item.id === sparePartId);
    if (!part) return;
    setResult(null);
    setRows((prev) => [
      ...prev,
      {
        key: newKey(),
        number: String(nextNumber(prev)),
        sparePartId: part.id,
        name: part.title,
        code: part.partNumber ?? "",
        sellable: true,
        x: "",
        y: "",
      },
    ]);
  }

  function patchRow(key: string, patch: Partial<PartRow>) {
    setResult(null);
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setResult(null);
    setRows((prev) => [
      ...prev,
      {
        key: newKey(),
        number: String(nextNumber(prev)),
        sparePartId: "",
        name: "",
        code: "",
        sellable: false,
        x: "",
        y: "",
      },
    ]);
  }

  function removeRow(key: string) {
    setResult(null);
    if (pickingKey === key) setPickingKey(null);
    setRows((prev) => prev.filter((row) => row.key !== key));
  }

  function handleImageClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (!pickingKey) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = clampPercent(((e.clientX - box.left) / box.width) * 100);
    const y = clampPercent(((e.clientY - box.top) / box.height) * 100);
    patchRow(pickingKey, { x: String(x), y: String(y) });
    setPickingKey(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    const seen = new Set<number>();
    const parts: ProductPart[] = [];
    for (const row of rows) {
      const number = Number(row.number);
      if (!Number.isInteger(number) || number < 1) {
        setResult({ ok: false, message: "شماره‌ی هر قطعه باید عدد صحیح و بزرگ‌تر از صفر باشد." });
        return;
      }
      if (seen.has(number)) {
        setResult({ ok: false, message: `شماره‌ی ${number} تکراری است؛ شماره‌ها باید یکتا باشند.` });
        return;
      }
      seen.add(number);
      if (!row.name.trim()) {
        setResult({
          ok: false,
          message: `برای قطعه‌ی شماره ${number} یک قطعه از فهرست قطعات یدکی انتخاب کنید.`,
        });
        return;
      }
      const hasHotspot = row.x !== "" && row.y !== "";
      const x = Number(row.x);
      const y = Number(row.y);
      if (hasHotspot && (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100)) {
        setResult({ ok: false, message: `مختصات قطعه‌ی شماره ${number} باید بین ۰ تا ۱۰۰ باشد.` });
        return;
      }
      parts.push({
        number,
        name: row.name.trim(),
        code: row.code.trim(),
        sellable: row.sellable,
        hotspot: hasHotspot ? { x: clampPercent(x), y: clampPercent(y) } : null,
      });
    }

    // قطعه‌های انتخاب‌شده هم‌زمان به‌عنوان «قطعات یدکی سازگار» محصول ثبت می‌شوند
    const sparePartIds = rows.map((row) => row.sparePartId).filter(Boolean);

    startTransition(async () => {
      setResult(await replaceProductPartsAction(productId, parts, sparePartIds));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* نقشه‌ی انفجاری + جانمایی */}
      {explodedViewUrl ? (
        <div className="overflow-hidden rounded-xl border bg-background">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-surface px-4 py-2.5">
            <p className="text-sm font-medium">نقشه‌ی انفجاری</p>
            <p className="text-xs text-muted">
              {pickingRow
                ? `برای جانمایی قطعه‌ی شماره ${pickingRow.number || "—"} روی تصویر کلیک کنید.`
                : `${placedCount} از ${rows.length} قطعه روی نقشه جانمایی شده است.`}
            </p>
          </div>
          <div className="p-4">
            <button
              type="button"
              onClick={handleImageClick}
              disabled={!pickingKey}
              aria-label="انتخاب مختصات قطعه روی نقشه انفجاری"
              className={`relative mx-auto block w-full max-w-lg overflow-hidden rounded-lg border-2 bg-surface transition-colors ${
                pickingKey ? "cursor-crosshair border-dashed border-primary" : "cursor-default border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={explodedViewUrl} alt="نقشه انفجاری محصول" className="block w-full" />
              {rows.map((row) =>
                row.x !== "" && row.y !== "" ? (
                  <span
                    key={row.key}
                    style={{ left: `${Number(row.x)}%`, top: `${Number(row.y)}%` }}
                    className={`pointer-events-none absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ring-2 ring-surface ${
                      row.key === pickingKey
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-primary ring-primary"
                    }`}
                  >
                    {row.number || "?"}
                  </span>
                ) : null,
              )}
            </button>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed bg-background p-4 text-sm text-muted">
          برای جانمایی قطعه‌ها ابتدا تصویر نقشه‌ی انفجاری را در تب «فایل‌ها» بارگذاری کنید؛ بدون آن
          امکان جانمایی روی نقشه وجود ندارد.
        </p>
      )}

      {/* نوار افزودن قطعه */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        {catalogOptions.length > 0 && (
          <label className="flex min-w-64 flex-1 flex-col gap-1.5 text-xs text-muted sm:max-w-sm">
            افزودن از فهرست قطعات یدکی
            <SearchableSelect
              options={catalogOptions}
              value=""
              onChange={(id) => id && addFromCatalog(id)}
              ariaLabel="افزودن قطعه از فهرست قطعات یدکی"
              placeholder="جست‌وجو در قطعات یدکی…"
            />
          </label>
        )}
        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= MAX_PARTS}
          className="flex items-center gap-1 rounded-lg border px-3 py-2.5 text-sm hover:bg-background disabled:opacity-50"
        >
          <Plus className="size-4" />
          افزودن ردیف خالی
        </button>
      </div>

      {/* فهرست قطعه‌ها */}
      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-background p-8 text-center text-sm text-muted">
            هنوز قطعه‌ای ثبت نشده است؛ از فهرست بالا یک قطعه انتخاب کنید.
          </p>
        ) : (
          rows.map((row) => (
            <div
              key={row.key}
              className={`flex flex-wrap items-center gap-2 rounded-xl border bg-surface p-2 transition-colors ${
                row.key === pickingKey ? "border-primary ring-1 ring-primary/20" : ""
              }`}
            >
              <TextInput
                type="number"
                min={1}
                step={1}
                dir="ltr"
                value={row.number}
                onChange={(e) => patchRow(row.key, { number: e.target.value })}
                aria-label="شماره قطعه"
                title="شماره قطعه"
                className="!w-20 text-center"
              />
              <div className="min-w-56 flex-1 ">
                <SearchableSelect
                  options={catalogOptions}
                  value={row.sparePartId}
                  onChange={(id) => pickFromCatalog(row.key, id)}
                  ariaLabel={`انتخاب قطعه‌ی یدکی برای شماره ${row.number || ""}`}
                  placeholder={row.name || "انتخاب از قطعات یدکی…"}
                  emptyMessage="قطعه‌ی یدکی‌ای ثبت نشده است."
                />
              </div>

              <span
                dir="ltr"
                title="کد قطعه"
                className="rounded-md bg-background px-2 py-1.5 text-xs text-muted"
              >
                {row.code || "—"}
              </span>
              <span
                dir="ltr"
                title="مختصات روی نقشه (٪)"
                className="rounded-md bg-background px-2 py-1.5 text-xs text-muted"
              >
                {row.x !== "" && row.y !== "" ? `${row.x} / ${row.y}` : "—"}
              </span>
              <label
                title="قابل فروش"
                className="flex items-center gap-1.5 rounded-md bg-background px-2 py-1.5 text-xs"
              >
                <input
                  type="checkbox"
                  checked={row.sellable}
                  onChange={(e) => patchRow(row.key, { sellable: e.target.checked })}
                  className="size-3.5 rounded border accent-primary"
                />
                قابل فروش
              </label>

              {explodedViewUrl && (
                <button
                  type="button"
                  onClick={() => setPickingKey(row.key === pickingKey ? null : row.key)}
                  aria-label={
                    row.key === pickingKey ? "انصراف از جانمایی" : "انتخاب مختصات روی عکس"
                  }
                  title={row.key === pickingKey ? "انصراف از جانمایی" : "انتخاب روی عکس"}
                  className={`rounded-lg border p-2 transition-colors ${
                    row.key === pickingKey
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted hover:border-primary hover:text-primary"
                  }`}
                >
                  <Crosshair className="size-4" />
                </button>
              )}
              {(row.x !== "" || row.y !== "") && (
                <button
                  type="button"
                  onClick={() => patchRow(row.key, { x: "", y: "" })}
                  aria-label="پاک‌کردن مختصات"
                  title="پاک‌کردن مختصات"
                  className="rounded-lg p-2 text-muted hover:text-danger"
                >
                  <Eraser className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                aria-label={`حذف قطعه‌ی شماره ${row.number || ""}`}
                title="حذف قطعه"
                className="rounded-lg p-2 text-muted hover:bg-danger-surface hover:text-danger"
              >
                <X className="size-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* نوار ذخیره */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4">
        <SubmitButton pending={isPending}>ذخیره قطعات</SubmitButton>
        <p className="text-xs text-muted">
          قطعه‌های انتخاب‌شده به‌صورت خودکار به قطعات یدکی سازگار این محصول اضافه می‌شوند.
          {rows.length >= MAX_PARTS && ` حداکثر ${MAX_PARTS} قطعه برای هر محصول مجاز است.`}
        </p>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && <FormMessage tone="danger">{result.message}</FormMessage>}
      </div>
    </form>
  );
}
