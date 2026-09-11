import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { brandsApi } from "@/lib/api";
import type { BackofficeBrand } from "@/lib/api/backoffice/brands";
import { formatDate } from "@/lib/format";
import { deleteBrandAction } from "./actions";

export const metadata: Metadata = { title: "برندها" };

const columns: Column<BackofficeBrand>[] = [
  { key: "title", header: "عنوان", cell: (b) => b.title },
  { key: "slug", header: "اسلاگ", cell: (b) => <span dir="ltr">{b.slug}</span> },
  {
    key: "exclusive",
    header: "نمایندگی",
    cell: (b) =>
      b.isExclusiveDistributor ? (
        <Badge tone="info">انحصاری</Badge>
      ) : (
        <span className="text-muted">—</span>
      ),
  },
  { key: "createdAt", header: "تاریخ ایجاد", cell: (b) => formatDate(b.createdAt) },
  {
    key: "actions",
    header: "عملیات",
    className: "w-px",
    cell: (b) => (
      <RowActionsMenu
        viewHref={`/brands/${b.id}`}
        editHref={`/brands/${b.id}`}
        onDelete={deleteBrandAction.bind(null, b.id)}
      />
    ),
  },
];

export default async function BrandsPage() {
  const brands = await brandsApi.list();

  return (
    <>
      <PageHeader
        title="برندها"
        description="برندهای موجود در فروشگاه"
        actions={
          <LinkButton href="/brands/new">
            <Plus className="size-4" />
            برند جدید
          </LinkButton>
        }
      />
      <DataTable
        columns={columns}
        rows={brands}
        getRowKey={(b) => b.id}
        emptyMessage="هنوز برندی ثبت نشده است."
      />
    </>
  );
}
