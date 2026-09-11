import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { contentApi } from "@/lib/api";
import type { SeoEntityType } from "@/lib/api/backoffice/content";
import { SeoForm } from "./seo-form";

export const metadata: Metadata = { title: "سئو" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const TYPES: { value: SeoEntityType; label: string }[] = [
  { value: "product", label: "محصول" },
  { value: "article", label: "مقاله" },
  { value: "category", label: "دسته" },
  { value: "brand", label: "برند" },
];

function isType(v: string | undefined): v is SeoEntityType {
  return TYPES.some((t) => t.value === v);
}

export default async function SeoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const entityType = typeof sp.entityType === "string" ? sp.entityType : "product";
  const entityId = typeof sp.entityId === "string" ? sp.entityId : "";
  const activeType: SeoEntityType = isType(entityType) ? entityType : "product";

  const initial =
    entityId.trim().length > 0
      ? await contentApi.getSeo(activeType, entityId).catch(() => null)
      : null;

  return (
    <>
      <PageHeader
        title="سئو"
        description="ویرایش متادیتای سئو برای محصول، مقاله، دسته یا برند"
      />

      <Card className="mb-4">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-muted">نوع موجودیت</span>
            <select
              name="entityType"
              defaultValue={activeType}
              className="w-40 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">شناسه موجودیت</span>
            <input
              name="entityId"
              dir="ltr"
              defaultValue={entityId}
              className="w-64 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            بارگذاری
          </button>
        </form>
      </Card>

      {!entityId.trim() ? (
        <EmptyState
          title="شناسه موجودیت را وارد کنید"
          description="نوع و شناسه موجودیت را انتخاب کنید تا متادیتای سئو نمایش داده شود."
        />
      ) : (
        <Card>
          <SeoForm
            entityType={activeType}
            entityId={entityId}
            initial={initial}
          />
        </Card>
      )}

      <p className="mt-4 text-xs text-muted">
        شناسه‌ها را می‌توانید از صفحات{" "}
        <Link href="/products" className="text-primary hover:underline">
          محصولات
        </Link>{" "}
        و{" "}
        <Link href="/articles" className="text-primary hover:underline">
          مقالات
        </Link>{" "}
        بردارید.
      </p>
    </>
  );
}
