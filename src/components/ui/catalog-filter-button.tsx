"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SearchableSelect } from "@/components/ui/searchable-select";

/** گزینه‌ی مرجع (دسته‌بندی/برند) برای انتخابگرهای فیلتر و فرم — `id` + `title` خام API. */
export type RefOption = { id: string; title: string };

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "همه" },
  { value: "active", label: "فعال" },
  { value: "draft", label: "پیش‌نویس" },
];

/**
 * دکمه‌ی فیلتر مشترک صفحات کاتالوگ (محصولات، انبار و مشابه) — مودالی با دسته‌بندی/برند
 * و اختیاراً وضعیت باز می‌کند و انتخاب را روی `searchParams` می‌نویسد (مثل `SearchField`،
 * `skip` هم صفر می‌شود). فیلترهای فعال با شمارنده روی دکمه نشان داده می‌شوند.
 */
export function CatalogFilterButton({
  title,
  basePath,
  categories,
  brands,
  showStatus = false,
}: {
  /** عنوان مودال، مثل «فیلتر محصولات» */
  title: string;
  /** مسیر صفحه بدون query، برای ساخت لینک جدید */
  basePath: string;
  categories: RefOption[];
  brands: RefOption[];
  /** فیلتر وضعیت فعال/پیش‌نویس را هم نشان بده (فقط برای محصولات معنادار است) */
  showStatus?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const currentCategoryId = searchParams.get("categoryId") ?? "";
  const currentBrandId = searchParams.get("brandId") ?? "";
  const currentStatus =
    searchParams.get("isActive") === "true"
      ? "active"
      : searchParams.get("isActive") === "false"
        ? "draft"
        : "";

  const [categoryId, setCategoryId] = useState(currentCategoryId);
  const [brandId, setBrandId] = useState(currentBrandId);
  const [status, setStatus] = useState(currentStatus);

  const activeCount = [
    currentCategoryId,
    currentBrandId,
    showStatus ? currentStatus : "",
  ].filter(Boolean).length;

  function openModal() {
    setCategoryId(currentCategoryId);
    setBrandId(currentBrandId);
    setStatus(currentStatus);
    setOpen(true);
  }

  function apply() {
    const next = new URLSearchParams(searchParams);
    if (categoryId) next.set("categoryId", categoryId);
    else next.delete("categoryId");
    if (brandId) next.set("brandId", brandId);
    else next.delete("brandId");
    if (showStatus) {
      if (status === "active") next.set("isActive", "true");
      else if (status === "draft") next.set("isActive", "false");
      else next.delete("isActive");
    }
    next.delete("skip");
    router.push(next.toString() ? `${basePath}?${next}` : basePath);
    setOpen(false);
  }

  function clearAll() {
    setCategoryId("");
    setBrandId("");
    setStatus("");
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="relative flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <SlidersHorizontal className="size-4" />
        فیلتر
        {activeCount > 0 && (
          <span className="absolute -end-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <Modal
          title={title}
          onClose={() => setOpen(false)}
          footer={
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-muted hover:text-foreground"
              >
                پاک‌کردن فیلترها
              </button>
              <button
                type="button"
                onClick={apply}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                اعمال فیلتر
              </button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">دسته‌بندی</label>
              <SearchableSelect
                ariaLabel="دسته‌بندی"
                placeholder="همه‌ی دسته‌بندی‌ها"
                value={categoryId}
                onChange={setCategoryId}
                options={categories.map((c) => ({ value: c.id, label: c.title }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">برند</label>
              <SearchableSelect
                ariaLabel="برند"
                placeholder="همه‌ی برندها"
                value={brandId}
                onChange={setBrandId}
                options={brands.map((b) => ({ value: b.id, label: b.title }))}
              />
            </div>

            {showStatus && (
              <div>
                <label htmlFor="status-filter" className="mb-1.5 block text-sm font-medium">
                  وضعیت
                </label>
                <select
                  id="status-filter"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
