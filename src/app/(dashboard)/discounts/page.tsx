import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { discountsApi } from "@/lib/api";
import type { BackofficeDiscount } from "@/lib/api/backoffice/discounts";
import { parsePageParams } from "@/lib/pagination";
import { formatNumber, formatToman } from "@/lib/format";
import { deleteDiscountAction } from "./actions";

export const metadata: Metadata = { title: "کدهای تخفیف" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const columns: Column<BackofficeDiscount>[] = [
  {
    key: "code",
    header: "کد",
    cell: (d) => (
      <span className="font-medium" dir="ltr">
        {d.code}
      </span>
    ),
  },
  {
    key: "amount",
    header: "مقدار",
    cell: (d) =>
      d.amountType === "percent"
        ? `${formatNumber(d.value)}٪`
        : formatToman(d.value),
  },
  {
    key: "usage",
    header: "دفعات استفاده",
    className: "tabular-nums",
    cell: (d) => formatNumber(d.usageCount),
  },
  {
    key: "status",
    header: "وضعیت",
    cell: (d) =>
      d.isActive ? (
        <Badge tone="success">فعال</Badge>
      ) : (
        <Badge tone="neutral">غیرفعال</Badge>
      ),
  },
  {
    key: "actions",
    header: "عملیات",
    className: "w-px",
    cell: (d) => (
      <RowActionsMenu
        viewHref={`/discounts/${d.id}`}
        editHref={`/discounts/${d.id}`}
        onDelete={deleteDiscountAction.bind(null, d.id)}
      />
    ),
  },
];

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { skip, take } = parsePageParams(sp);
  const { items, total } = await discountsApi.list({ skip, take });

  return (
    <>
      <PageHeader
        title="کدهای تخفیف"
        description="کدهای تخفیف فعال و غیرفعال"
        actions={
          <LinkButton href="/discounts/new">
            <Plus className="size-4" />
            کد جدید
          </LinkButton>
        }
      />
      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(d) => d.id}
        emptyMessage="کد تخفیفی ثبت نشده است."
      />
      <Pagination
        basePath="/discounts"
        total={total}
        skip={skip}
        take={take}
      />
    </>
  );
}
