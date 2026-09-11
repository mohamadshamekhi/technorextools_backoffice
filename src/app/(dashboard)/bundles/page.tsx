import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { bundlesApi } from "@/lib/api";
import type { BackofficeBundle } from "@/lib/api/backoffice/bundles";
import { formatNumber, formatToman } from "@/lib/format";
import { deleteBundleAction } from "./actions";

export const metadata: Metadata = { title: "پکیج‌ها" };

const columns: Column<BackofficeBundle>[] = [
  { key: "title", header: "عنوان", cell: (b) => b.title },
  {
    key: "price",
    header: "قیمت پکیج",
    className: "tabular-nums",
    cell: (b) => formatToman(b.bundlePrice),
  },
  {
    key: "items",
    header: "تعداد اقلام",
    className: "tabular-nums",
    cell: (b) => formatNumber(b.items.length),
  },
  {
    key: "status",
    header: "وضعیت",
    cell: (b) =>
      b.isActive ? (
        <Badge tone="success">فعال</Badge>
      ) : (
        <Badge tone="neutral">غیرفعال</Badge>
      ),
  },
  {
    key: "actions",
    header: "عملیات",
    className: "w-px",
    cell: (b) => (
      <RowActionsMenu
        viewHref={`/bundles/${b.id}`}
        editHref={`/bundles/${b.id}`}
        onDelete={deleteBundleAction.bind(null, b.id)}
      />
    ),
  },
];

export default async function BundlesPage() {
  const bundles = await bundlesApi.list();

  return (
    <>
      <PageHeader
        title="پکیج‌ها"
        description="پکیج‌های فروش ترکیبی محصولات"
        actions={
          <LinkButton href="/bundles/new">
            <Plus className="size-4" />
            پکیج جدید
          </LinkButton>
        }
      />
      <DataTable
        columns={columns}
        rows={bundles}
        getRowKey={(b) => b.id}
        emptyMessage="هنوز پکیجی ساخته نشده است."
      />
    </>
  );
}
