import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { SearchField } from "@/components/ui/search-field";
import { LinkButton } from "@/components/ui/link-button";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { Plus, Percent } from "lucide-react";
import { productsApi, guarded } from "@/lib/api";
import type { BackofficeProduct } from "@/lib/api/backoffice/products";
import { parsePageParams } from "@/lib/pagination";
import { formatToman } from "@/lib/format";
import { deleteProductAction } from "./actions";

export const metadata: Metadata = { title: "محصولات" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const columns: Column<BackofficeProduct>[] = [
  { key: "title", header: "عنوان", cell: (p) => p.title },
  { key: "brand", header: "برند", cell: (p) => p.brand?.title ?? "—" },
  { key: "category", header: "دسته", cell: (p) => p.category?.title ?? "—" },
  {
    key: "price",
    header: "قیمت پایه",
    className: "text-end tabular-nums",
    cell: (p) => formatToman(p.basePrice),
  },
  {
    key: "status",
    header: "وضعیت",
    cell: (p) => (
      <div className="flex gap-1">
        {p.isActive ? (
          <Badge tone="success">فعال</Badge>
        ) : (
          <Badge tone="neutral">پیش‌نویس</Badge>
        )}
        {p.isAmazingDeal && <Badge tone="warning">شگفت‌انگیز</Badge>}
        {p.isFeatured && <Badge tone="info">هیرو</Badge>}
      </div>
    ),
  },
  {
    key: "actions",
    header: "عملیات",
    className: "w-px",
    cell: (p) => (
      <RowActionsMenu
        viewHref={`/products/${p.id}`}
        editHref={`/products/${p.id}`}
        onDelete={deleteProductAction.bind(null, p.id)}
      />
    ),
  },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { skip, take } = parsePageParams(sp);
  const search = typeof sp.search === "string" ? sp.search : undefined;

  const { items, total } = await guarded(
    productsApi.list({ skip, take, search }),
  );

  return (
    <>
      <PageHeader
        title="محصولات"
        description="کاتالوگ محصولات فروشگاه"
        actions={
          <>
            <SearchField placeholder="نام محصول…" />
            <LinkButton href="/products/bulk-price-update" variant="ghost">
              <Percent className="size-4" />
              تغییر قیمت گروهی
            </LinkButton>
            <LinkButton href="/products/new">
              <Plus className="size-4" />
              محصول جدید
            </LinkButton>
          </>
        }
      />

      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(p) => p.id}
        emptyMessage="محصولی یافت نشد."
      />

      <Pagination
        basePath="/products"
        params={{ search }}
        total={total}
        skip={skip}
        take={take}
      />
    </>
  );
}
