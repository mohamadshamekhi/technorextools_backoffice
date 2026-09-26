import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { newsletterApi, guarded } from "@/lib/api";
import type { NewsletterSubscriber } from "@/lib/api/backoffice/newsletter";
import { parsePageParams } from "@/lib/pagination";
import { formatDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "مشترکین خبرنامه" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/** فیلترهای صفحه؛ مقدار `undefined` یعنی بدون فیلتر */
const FILTERS: { key: string; label: string; isActive?: boolean }[] = [
  { key: "all", label: "همه" },
  { key: "active", label: "فعال", isActive: true },
  { key: "inactive", label: "لغو اشتراک", isActive: false },
];

const columns: Column<NewsletterSubscriber>[] = [
  {
    key: "contact",
    header: "ایمیل / موبایل",
    cell: (s) => <span dir="ltr">{s.contact}</span>,
  },
  {
    key: "isActive",
    header: "وضعیت",
    cell: (s) => (
      <Badge tone={s.isActive ? "success" : "neutral"}>
        {s.isActive ? "فعال" : "لغو اشتراک"}
      </Badge>
    ),
  },
  { key: "date", header: "تاریخ عضویت", cell: (s) => formatDate(s.createdAt) },
];

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { skip, take } = parsePageParams(sp);
  const rawFilter = typeof sp.filter === "string" ? sp.filter : "all";
  const activeFilter = FILTERS.find((f) => f.key === rawFilter) ?? FILTERS[0];

  const { items, total } = await guarded(
    newsletterApi.list({ skip, take, isActive: activeFilter.isActive }),
  );

  return (
    <>
      <PageHeader
        title="مشترکین خبرنامه"
        description={`${formatNumber(total)} مشترک ثبت‌شده`}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/newsletter" : `/newsletter?filter=${f.key}`}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              activeFilter.key === f.key
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(s) => s.id}
        emptyMessage="مشترکی ثبت نشده است."
      />
      <Pagination
        basePath="/newsletter"
        params={{ filter: activeFilter.key === "all" ? undefined : activeFilter.key }}
        total={total}
        skip={skip}
        take={take}
      />
    </>
  );
}
