"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export type SearchableSelectOption = {
  value: string;
  label: string;
  /** گروه نمایشی (مثل عنوان محصول برای گروه‌بندی واریانت‌ها) */
  group?: string;
  /** متن اضافی برای جست‌وجو (SKU، شناسه و ...) — در نتیجه نمایش داده نمی‌شود */
  searchText?: string;
};

/**
 * دراپ‌دان قابل‌جست‌وجو برای لیست‌های بلند (واریانت محصول، محصول و مشابه).
 * فیلتر روی برچسب + `searchText` انجام می‌شود؛ گروه‌بندی بر اساس `group` حفظ می‌شود.
 * کنترل صفحه‌کلید کامل دارد (Arrow/Enter/Escape) — جایگزین `<select>` ساده برای لیست‌های زیاد.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "انتخاب کنید",
  searchPlaceholder = "جست‌وجو…",
  ariaLabel,
  emptyMessage = "موردی یافت نشد.",
  className = "",
}: {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  ariaLabel: string;
  emptyMessage?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      `${o.label} ${o.searchText ?? ""}`.toLowerCase().includes(q),
    );
  }, [options, query]);

  const groups = useMemo(() => {
    const list: { group: string | undefined; items: SearchableSelectOption[] }[] = [];
    for (const opt of filtered) {
      const last = list[list.length - 1];
      if (last && last.group === opt.group) last.items.push(opt);
      else list.push({ group: opt.group, items: [opt] });
    }
    return list;
  }, [filtered]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function selectOption(opt: SearchableSelectOption) {
    onChange(opt.value);
    setOpen(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) selectOption(opt);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => {
          setQuery("");
          setActiveIndex(0);
          setOpen((o) => !o);
        }}
        className="flex w-full items-center justify-between gap-2 rounded-lg border bg-surface px-3 py-2.5 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        <span className={`truncate ${selected ? "" : "text-muted"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border bg-surface shadow-lg"
        >
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="size-4 shrink-0 text-muted" />
            <input
              ref={inputRef}
              type="text"
              dir="ltr"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-end text-sm outline-none placeholder:text-muted"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="پاک‌کردن جست‌وجو"
                className="shrink-0 text-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted">{emptyMessage}</p>
            ) : (
              groups.map((g, gi) => (
                <div key={gi}>
                  {g.group && (
                    <p className="px-3 pt-2 pb-1 text-xs font-medium text-muted">{g.group}</p>
                  )}
                  {g.items.map((opt) => {
                    const idx = filtered.indexOf(opt);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={opt.value === value}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => selectOption(opt)}
                        className={`flex w-full items-center justify-between px-3 py-2 text-start text-sm ${
                          idx === activeIndex ? "bg-border/40" : ""
                        } ${opt.value === value ? "font-medium text-primary" : ""}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
