import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { sparePartsApi, guarded } from "@/lib/api";
import type { BackofficeSparePart } from "@/lib/api/backoffice/spare-parts";
import { formatNumber, formatToman } from "@/lib/format";
import { deleteSparePartAction } from "./actions";

export const metadata: Metadata = { title: "قطعات یدکی" };

const columns: Column<BackofficeSparePart>[] = [
  { key: "title", header: "عنوان", cell: (p) => p.title },
  {
    key: "partNumber",
    header: "شماره قطعه",
    cell: (p) => (p.partNumber ? <span dir="ltr">{p.partNumber}</span> : <span className="text-muted">—</span>),
  },
  { key: "price", header: "قیمت", cell: (p) => formatToman(p.price) },
  { key: "stock", header: "موجودی", cell: (p) => formatNumber(p.stockQty) },
  {
    key: "status",
    header: "وضعیت",
    cell: (p) =>
      p.isActive ? <Badge tone="success">فعال</Badge> : <Badge tone="neutral">غیرفعال</Badge>,
  },
  {
    key: "actions",
    header: "عملیات",
    className: "w-px",
    cell: (p) => (
      <RowActionsMenu
        viewHref={`/spare-parts/${p.id}`}
        editHref={`/spare-parts/${p.id}`}
        onDelete={deleteSparePartAction.bind(null, p.id)}
      />
    ),
  },
];

export default async function SparePartsPage() {
  const parts = await guarded(sparePartsApi.list({ take: 100 }));

  return (
    <>
      <PageHeader
        title="قطعات یدکی"
        description="قطعات یدکی قابل فروش مستقل از محصولات"
        actions={
          <LinkButton href="/spare-parts/new">
            <Plus className="size-4" />
            قطعه جدید
          </LinkButton>
        }
      />
      <DataTable
        columns={columns}
        rows={parts}
        getRowKey={(p) => p.id}
        emptyMessage="هنوز قطعه‌ای ثبت نشده است."
      />
    </>
  );
}
