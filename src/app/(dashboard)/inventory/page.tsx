import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { inventoryApi } from "@/lib/api";
import { parsePageParams } from "@/lib/pagination";
import { InventoryRow } from "./inventory-row";

export const metadata: Metadata = { title: "انبار" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { skip, take } = parsePageParams(sp);
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const lowStock = sp.lowStock === "1";

  const { items, total } = await inventoryApi.list({
    skip,
    take,
    search,
    lowStock: lowStock || undefined,
  });

  return (
    <>
      <PageHeader
        title="انبار"
        description="ویرایش سریع موجودی و قیمت تنوع‌های محصول"
        actions={<SearchField placeholder="نام محصول یا SKU…" />}
      />

      <div className="mb-4">
        <Link
          href={lowStock ? "/inventory" : "/inventory?lowStock=1"}
          className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
            lowStock
              ? "bg-primary text-primary-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          فقط کم‌موجودی‌ها
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-surface">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b text-muted">
              <th className="px-4 py-3 text-start font-medium">محصول</th>
              <th className="px-4 py-3 text-start font-medium">موجودی</th>
              <th className="px-4 py-3 text-start font-medium">قیمت جایگزین</th>
              <th className="px-4 py-3 text-start font-medium">اقدام</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted">
                  تنوعی یافت نشد.
                </td>
              </tr>
            ) : (
              items.map((v) => <InventoryRow key={v.id} variant={v} />)
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath="/inventory"
        params={{ search, lowStock: lowStock ? "1" : undefined }}
        total={total}
        skip={skip}
        take={take}
      />
    </>
  );
}
