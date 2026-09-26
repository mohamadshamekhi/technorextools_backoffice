"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { TextInput, SubmitButton, FormMessage } from "@/components/ui/form-controls";
import { replaceHighlightsAction } from "./actions";
import type { ActionResult } from "@/lib/forms";
import type { ProductHighlight } from "@/lib/api/backoffice/products";

/** حداکثر تعداد آیتم نوار مشخصات شاخص (محدودیت بک‌اند) */
const MAX_HIGHLIGHTS = 12;

/** ردیف محلی فرم؛ `key` فقط کلید پایدار ری‌اکت است و به بک‌اند نمی‌رود */
type HighlightRow = ProductHighlight & { key: string };

let rowSeq = 0;
function newKey(): string {
  rowSeq += 1;
  return `highlight-${rowSeq}`;
}

/**
 * مشخصات شاخص محصول — با `PUT /backoffice/products/{id}/highlights` کل نوار
 * جایگزین می‌شود (لیست خالی یعنی حذف همه). `icon` کلید آیکون سمت فرانت است
 * (مثلاً `motor`)، نه آدرس تصویر.
 */
export function ProductHighlights({
  productId,
  initialHighlights,
}: {
  productId: string;
  initialHighlights: ProductHighlight[];
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [rows, setRows] = useState<HighlightRow[]>(() =>
    initialHighlights.map((h) => ({ ...h, key: newKey() })),
  );

  function patchRow(key: string, patch: Partial<ProductHighlight>) {
    setResult(null);
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setResult(null);
    setRows((prev) => [...prev, { key: newKey(), icon: "", value: "", label: "" }]);
  }

  function removeRow(key: string) {
    setResult(null);
    setRows((prev) => prev.filter((row) => row.key !== key));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    const highlights: ProductHighlight[] = [];
    for (const [index, row] of rows.entries()) {
      const icon = row.icon.trim();
      const value = row.value.trim();
      const label = row.label.trim();
      if (!icon || !value || !label) {
        setResult({
          ok: false,
          message: `ردیف ${index + 1}: کلید آیکون، مقدار و برچسب هر سه الزامی‌اند.`,
        });
        return;
      }
      highlights.push({ icon, value, label });
    }

    startTransition(async () => {
      setResult(await replaceHighlightsAction(productId, highlights));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="rounded-lg border bg-surface p-3 text-sm text-muted">
        این آیتم‌ها در نوار بالای صفحه‌ی محصول در سایت نمایش داده می‌شوند. «کلید آیکون» نام
        آیکون سمت فرانت است (مثلاً <span dir="ltr">motor</span> یا <span dir="ltr">weight</span>)،
        نه آدرس تصویر.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="px-2 py-2 text-start font-medium">کلید آیکون</th>
              <th className="px-2 py-2 text-start font-medium">مقدار</th>
              <th className="px-2 py-2 text-start font-medium">برچسب</th>
              <th className="w-px px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-2 py-6 text-center text-muted">
                  هنوز مشخصه‌ی شاخصی ثبت نشده است.
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={row.key} className="border-t align-top">
                <td className="px-2 py-2">
                  <TextInput
                    dir="ltr"
                    value={row.icon}
                    onChange={(e) => patchRow(row.key, { icon: e.target.value })}
                    aria-label={`کلید آیکون ردیف ${index + 1}`}
                    placeholder="motor"
                  />
                </td>
                <td className="px-2 py-2">
                  <TextInput
                    value={row.value}
                    onChange={(e) => patchRow(row.key, { value: e.target.value })}
                    aria-label={`مقدار ردیف ${index + 1}`}
                    placeholder="۱۲ وات"
                  />
                </td>
                <td className="px-2 py-2">
                  <TextInput
                    value={row.label}
                    onChange={(e) => patchRow(row.key, { label: e.target.value })}
                    aria-label={`برچسب ردیف ${index + 1}`}
                    placeholder="توان موتور"
                  />
                </td>
                <td className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    aria-label={`حذف مشخصه‌ی شاخص ردیف ${index + 1}`}
                    className="rounded-md p-1.5 text-muted hover:bg-danger-surface hover:text-danger"
                  >
                    <X className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t pt-4">
        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= MAX_HIGHLIGHTS}
          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-background disabled:opacity-50"
        >
          <Plus className="size-4" />
          افزودن مشخصه
        </button>
        <SubmitButton pending={isPending}>ذخیره مشخصات شاخص</SubmitButton>
        {rows.length >= MAX_HIGHLIGHTS && (
          <span className="text-xs text-muted">
            حداکثر {MAX_HIGHLIGHTS} مشخصه برای هر محصول مجاز است.
          </span>
        )}
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && <FormMessage tone="danger">{result.message}</FormMessage>}
      </div>
    </form>
  );
}
