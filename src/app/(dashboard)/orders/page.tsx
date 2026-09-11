import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { ordersApi, guarded } from "@/lib/api";
import {
  ORDER_PAYMENT_METHOD_LABELS,
  ORDER_STATUS_LABELS,
  type OrderListItem,
} from "@/lib/api/backoffice/orders";
import { ORDER_STATUS_TONE } from "./order-status";
import { parsePageParams } from "@/lib/pagination";
import { formatToman, formatDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "سفارش‌ها" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const columns: Column<OrderListItem>[] = [
  {
    key: "orderNumber",
    header: "شماره سفارش",
    cell: (o) => (
      <Link
        href={`/orders/${o.orderNumber}`}
        className="font-medium text-primary hover:underline"
        dir="ltr"
      >
        {o.orderNumber}
      </Link>
    ),
  },
  {
    key: "items",
    header: "اقلام",
    className: "text-end tabular-nums",
    cell: (o) => formatNumber(o.itemCount),
  },
  {
    key: "total",
    header: "مبلغ کل",
    className: "text-end tabular-nums",
    cell: (o) => formatToman(o.total),
  },
  {
    key: "status",
    header: "وضعیت",
    cell: (o) => (
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={ORDER_STATUS_TONE[o.status]}>
          {ORDER_STATUS_LABELS[o.status]}
        </Badge>
        {o.paymentMethod === "cash" && (
          <Badge tone="neutral">{ORDER_PAYMENT_METHOD_LABELS.cash}</Badge>
        )}
      </div>
    ),
  },
  { key: "placedAt", header: "تاریخ", cell: (o) => formatDate(o.placedAt) },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { skip, take } = parsePageParams(sp);

  const { items, total } = await guarded(ordersApi.list({ skip, take }));

  return (
    <>
      <PageHeader title="سفارش‌ها" description="سفارش‌های ثبت‌شده در فروشگاه" />

      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(o) => o.orderNumber}
        emptyMessage="سفارشی ثبت نشده است."
      />

      <Pagination basePath="/orders" total={total} skip={skip} take={take} />
    </>
  );
}
