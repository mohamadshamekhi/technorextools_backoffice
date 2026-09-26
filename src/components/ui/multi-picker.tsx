"use client";

import { X } from "lucide-react";
import { SearchableSelect, type SearchableSelectOption } from "./searchable-select";

/**
 * انتخاب چندتایی با جست‌وجو: گزینه‌ی انتخاب‌شده به‌صورت چیپ زیر دراپ‌دان نمایش داده می‌شود
 * و با دکمه‌ی ضربدر برداشته می‌شود. `selected` لیست شناسه‌هاست.
 */
export function MultiPicker({
  options,
  selected,
  onChange,
  ariaLabel,
  placeholder,
  emptyLabel = "موردی انتخاب نشده است.",
}: {
  options: SearchableSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  ariaLabel: string;
  placeholder?: string;
  emptyLabel?: string;
}) {
  const labelById = new Map(options.map((o) => [o.value, o.label]));
  const available = options.filter((o) => !selected.includes(o.value));

  return (
    <div className="space-y-2">
      <SearchableSelect
        options={available}
        value=""
        onChange={(id) => id && onChange([...selected, id])}
        ariaLabel={ariaLabel}
        placeholder={placeholder}
      />
      {selected.length === 0 ? (
        <p className="text-sm text-muted">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {selected.map((id) => (
            <li
              key={id}
              className="flex items-center gap-1 rounded-full border border-border bg-surface py-1 ps-3 pe-1 text-sm"
            >
              {labelById.get(id) ?? id}
              <button
                type="button"
                onClick={() => onChange(selected.filter((s) => s !== id))}
                aria-label={`حذف ${labelById.get(id) ?? id}`}
                className="rounded-full p-1 text-muted hover:bg-danger-surface hover:text-danger"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
