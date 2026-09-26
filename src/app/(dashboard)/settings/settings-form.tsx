"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { TextInput, SubmitButton, FormMessage } from "@/components/ui/form-controls";
import { saveSettingsAction } from "./actions";
import { type ActionResult } from "@/lib/forms";
import type { SettingEntry } from "@/lib/api/backoffice/settings";

type Row = SettingEntry & { id: string };

export function SettingsForm({ initial }: { initial: SettingEntry[] }) {
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState<Row[]>(
    initial.map((e, i) => ({ ...e, id: `init-${i}` })),
  );
  const [result, setResult] = useState<ActionResult | null>(null);

  // کلیدهای تکراری را همان لحظه زیر اینپوت نشان می‌دهیم
  const keyCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.key.trim()) keyCounts.set(r.key, (keyCounts.get(r.key) ?? 0) + 1);
  }
  const dupKeys = new Set(
    [...keyCounts].filter(([, c]) => c > 1).map(([k]) => k),
  );

  function update(id: string, patch: Partial<SettingEntry>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, key: "", value: "" },
    ]);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      setResult(
        await saveSettingsAction(rows.map(({ key, value }) => ({ key, value }))),
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="text-sm text-muted">هنوز تنظیمی ثبت نشده است.</p>
        )}
        {rows.map((row) => {
          const isNew = row.id.startsWith("new-");
          return (
            <div key={row.id} className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <TextInput
                  aria-label="کلید"
                  dir="ltr"
                  value={row.key}
                  readOnly={!isNew}
                  onChange={(e) => update(row.id, { key: e.target.value })}
                  placeholder="کلید"
                  aria-invalid={dupKeys.has(row.key) || undefined}
                  className={`sm:w-56 ${isNew ? "" : "bg-border/30"}`}
                />
                <TextInput
                  aria-label={`مقدار ${row.key}`}
                  value={row.value}
                  onChange={(e) => update(row.id, { value: e.target.value })}
                  placeholder="مقدار"
                  className="min-w-0 flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`حذف ${row.key || "ردیف"}`}
                  className="rounded-lg p-2 text-muted hover:bg-danger-surface hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {dupKeys.has(row.key) && (
                <p role="alert" className="text-xs text-danger">
                  این کلید تکراری است.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 text-sm text-primary hover:opacity-80"
      >
        <Plus className="size-4" />
        افزودن تنظیم
      </button>

      <div className="flex items-center gap-3 border-t pt-4">
        <SubmitButton pending={isPending} />
        {result?.ok && <FormMessage tone="success">تنظیمات ذخیره شد.</FormMessage>}
        {result && !result.ok && (
          <FormMessage tone="danger">{result.message}</FormMessage>
        )}
      </div>
    </form>
  );
}
