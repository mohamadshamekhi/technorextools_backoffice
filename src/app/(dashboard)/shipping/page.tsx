import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { shippingApi } from "@/lib/api";
import type { ShippingMethod } from "@/lib/api/backoffice/shipping";
import { formatToman } from "@/lib/format";
import { deleteShippingAction } from "./actions";

export const metadata: Metadata = { title: "روش‌های ارسال" };

const COST_TYPE_LABELS: Record<string, string> = {
  flat: "ثابت",
  by_weight: "بر اساس وزن",
};

const columns: Column<ShippingMethod>[] = [
  { key: "title", header: "عنوان", cell: (m) => m.title },
  { key: "type", header: "نوع", cell: (m) => COST_TYPE_LABELS[m.costType] ?? m.costType },
  {
    key: "cost",
    header: "هزینه",
    className: "tabular-nums",
    cell: (m) => (m.cost === 0 ? "رایگان" : formatToman(m.cost)),
  },
  {
    key: "freeOver",
    header: "آستانه رایگان",
    className: "tabular-nums",
    cell: (m) => (m.freeOverAmount != null ? formatToman(m.freeOverAmount) : "—"),
  },
  {
    key: "status",
    header: "وضعیت",
    cell: (m) =>
      m.isActive ? (
        <Badge tone="success">فعال</Badge>
      ) : (
        <Badge tone="neutral">غیرفعال</Badge>
      ),
  },
  {
    key: "actions",
    header: "عملیات",
    className: "w-px",
    cell: (m) => (
      <RowActionsMenu
        viewHref={`/shipping/${m.id}`}
        editHref={`/shipping/${m.id}`}
        onDelete={deleteShippingAction.bind(null, m.id)}
      />
    ),
  },
];

export default async function ShippingPage() {
  const methods = await shippingApi.list();

  return (
    <>
      <PageHeader
        title="روش‌های ارسال"
        description="روش‌ها و هزینه‌های ارسال سفارش"
        actions={
          <LinkButton href="/shipping/new">
            <Plus className="size-4" />
            روش جدید
          </LinkButton>
        }
      />
      <DataTable
        columns={columns}
        rows={methods}
        getRowKey={(m) => m.id}
        emptyMessage="هنوز روش ارسالی ثبت نشده است."
      />
    </>
  );
}
