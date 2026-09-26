"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { TextInput, SubmitButton, FormMessage } from "@/components/ui/form-controls";
import { replaceModel3dHotspotsAction } from "./actions";
import type { ActionResult } from "@/lib/forms";
import type { Model3dHotspot, Model3dHotspotInput } from "@/lib/api/backoffice/products";

/** ردیف محلی فرم؛ مختصات به‌صورت رشته نگه‌داری می‌شود تا تایپ‌کردن روان بماند */
type HotspotRow = {
  /** کلید پایدار ری‌اکت — به بک‌اند فرستاده نمی‌شود */
  rowKey: string;
  key: string;
  label: string;
  description: string;
  x: string;
  y: string;
  z: string;
};

let rowSeq = 0;
function newRowKey(): string {
  rowSeq += 1;
  return `hotspot-${rowSeq}`;
}

function toRow(hotspot: Model3dHotspot): HotspotRow {
  const [x, y, z] = hotspot.position;
  return {
    rowKey: newRowKey(),
    // بک‌اند در پاسخ `id` می‌دهد نه `key`؛ همان را کلید یکتای ویرایش بعدی می‌گیریم
    key: hotspot.id,
    label: hotspot.label,
    description: hotspot.description ?? "",
    x: String(x),
    y: String(y),
    z: String(z),
  };
}

/**
 * نقاط برچسب‌دار روی مدل سه‌بعدی محصول — با
 * `PUT /backoffice/products/{id}/model3d-hotspots` کل لیست جایگزین می‌شود.
 * `key` در هر محصول یکتاست و `position` سه‌تایی `[x, y, z]` در فضای مختصات خود
 * مدل است (برخلاف قطعات نقشه‌ی انفجاری، درصد نیست).
 */
export function ProductHotspots({
  productId,
  initialHotspots,
  model3dUrl,
}: {
  productId: string;
  initialHotspots: Model3dHotspot[];
  model3dUrl: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [rows, setRows] = useState<HotspotRow[]>(() => initialHotspots.map(toRow));

  function patchRow(rowKey: string, patch: Partial<HotspotRow>) {
    setResult(null);
    setRows((prev) => prev.map((row) => (row.rowKey === rowKey ? { ...row, ...patch } : row)));
  }

  /** مقدار یک محور مختصات را عوض می‌کند (کلید محاسبه‌شده، جدا از patchRow) */
  function setAxis(rowKey: string, axis: "x" | "y" | "z", value: string) {
    setResult(null);
    setRows((prev) =>
      prev.map((row) => (row.rowKey === rowKey ? { ...row, [axis]: value } : row)),
    );
  }

  function addRow() {
    setResult(null);
    setRows((prev) => [
      ...prev,
      { rowKey: newRowKey(), key: "", label: "", description: "", x: "0", y: "0", z: "0" },
    ]);
  }

  function removeRow(rowKey: string) {
    setResult(null);
    setRows((prev) => prev.filter((row) => row.rowKey !== rowKey));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    const seen = new Set<string>();
    const hotspots: Model3dHotspotInput[] = [];
    for (const [index, row] of rows.entries()) {
      const key = row.key.trim();
      const label = row.label.trim();
      if (!key) {
        setResult({ ok: false, message: `ردیف ${index + 1}: کلید یکتا الزامی است.` });
        return;
      }
      if (seen.has(key)) {
        setResult({ ok: false, message: `کلید «${key}» تکراری است؛ کلیدها باید یکتا باشند.` });
        return;
      }
      seen.add(key);
      if (!label) {
        setResult({ ok: false, message: `ردیف ${index + 1}: برچسب الزامی است.` });
        return;
      }
      const position: [number, number, number] = [Number(row.x), Number(row.y), Number(row.z)];
      if (!position.every((n) => Number.isFinite(n))) {
        setResult({ ok: false, message: `ردیف ${index + 1}: مختصات باید عدد باشد.` });
        return;
      }
      hotspots.push({
        key,
        label,
        description: row.description.trim() || null,
        position,
      });
    }

    startTransition(async () => {
      setResult(await replaceModel3dHotspotsAction(productId, hotspots));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!model3dUrl && (
        <p className="rounded-lg border bg-surface p-3 text-sm text-muted">
          برای این محصول هنوز فایل سه‌بعدی بارگذاری نشده است؛ می‌توانید آن را در تب «فایل‌ها»
          اضافه کنید. نقاط بدون فایل مدل هم ذخیره می‌شوند ولی در سایت دیده نخواهند شد.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="px-2 py-2 text-start font-medium">کلید یکتا</th>
              <th className="px-2 py-2 text-start font-medium">برچسب</th>
              <th className="px-2 py-2 text-start font-medium">توضیح (اختیاری)</th>
              <th className="px-2 py-2 text-start font-medium">موقعیت در مدل (x, y, z)</th>
              <th className="w-px px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-2 py-6 text-center text-muted">
                  هنوز نقطه‌ای ثبت نشده است.
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={row.rowKey} className="border-t align-top">
                <td className="px-2 py-2">
                  <TextInput
                    dir="ltr"
                    value={row.key}
                    onChange={(e) => patchRow(row.rowKey, { key: e.target.value })}
                    aria-label={`کلید یکتای نقطه‌ی ردیف ${index + 1}`}
                    placeholder="motor"
                  />
                </td>
                <td className="px-2 py-2">
                  <TextInput
                    value={row.label}
                    onChange={(e) => patchRow(row.rowKey, { label: e.target.value })}
                    aria-label={`برچسب نقطه‌ی ردیف ${index + 1}`}
                    placeholder="موتور"
                  />
                </td>
                <td className="px-2 py-2">
                  <TextInput
                    value={row.description}
                    onChange={(e) => patchRow(row.rowKey, { description: e.target.value })}
                    aria-label={`توضیح نقطه‌ی ردیف ${index + 1}`}
                    placeholder="موتور بدون ذغال"
                  />
                </td>
                <td className="px-2 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {(["x", "y", "z"] as const).map((axis) => (
                      <TextInput
                        key={axis}
                        type="number"
                        step="any"
                        dir="ltr"
                        value={row[axis]}
                        onChange={(e) => setAxis(row.rowKey, axis, e.target.value)}
                        aria-label={`مختصات ${axis} نقطه‌ی ردیف ${index + 1}`}
                        placeholder={axis}
                        className="w-24"
                      />
                    ))}
                  </div>
                </td>
                <td className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => removeRow(row.rowKey)}
                    aria-label={`حذف نقطه‌ی ردیف ${index + 1}`}
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
          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-background"
        >
          <Plus className="size-4" />
          افزودن نقطه
        </button>
        <SubmitButton pending={isPending}>ذخیره نقاط</SubmitButton>
        {result?.ok && <FormMessage tone="success">ذخیره شد.</FormMessage>}
        {result && !result.ok && <FormMessage tone="danger">{result.message}</FormMessage>}
      </div>
    </form>
  );
}
