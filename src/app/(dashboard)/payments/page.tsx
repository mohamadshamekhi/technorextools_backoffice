import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import type { BadgeTone } from "@/components/ui/badge";
import { paymentsApi } from "@/lib/api";
import {
  PAYMENT_STATUS_LABELS,
  type BackofficePayment,
  type PaymentStatus,
} from "@/lib/api/backoffice/payments";
import { parsePageParams } from "@/lib/pagination";
import { formatDateTime, formatToman } from "@/lib/format";

export const metadata: Metadata = { title: "پرداخت‌ها" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const STATUS_TONE: Record<PaymentStatus, BadgeTone> = {
  pending: "warning",
  success: "success",
  failed: "danger",
};

const columns: Column<BackofficePayment>[] = [
  {
    key: "order",
    header: "سفارش",
    cell: (p) => (
      <Link
        href={`/orders/${p.orderNumber}`}
        className="font-medium text-primary hover:underline"
        dir="ltr"
      >
        {p.orderNumber}
      </Link>
    ),
  },
  {
    key: "amount",
    header: "مبلغ",
    className: "tabular-nums",
    cell: (p) => formatToman(p.amount),
  },
  { key: "gateway", header: "درگاه", cell: (p) => p.gateway },
  {
    key: "refId",
    header: "کد پیگیری",
    cell: (p) => (p.refId ? <span dir="ltr">{p.refId}</span> : "—"),
  },
  {
    key: "status",
    header: "وضعیت",
    cell: (p) => (
      <Badge tone={STATUS_TONE[p.status]}>
        {PAYMENT_STATUS_LABELS[p.status]}
      </Badge>
    ),
  },
  {
    key: "paidAt",
    header: "زمان",
    cell: (p) => formatDateTime(p.paidAt ?? p.createdAt),
  },
];

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { skip, take } = parsePageParams(sp);
  const { items, total } = await paymentsApi.list({ skip, take });

  return (
    <>
      <PageHeader
        title="پرداخت‌ها"
        description="تراکنش‌های درگاه پرداخت"
        actions={
          <LinkButton href="/payment-methods" variant="ghost">
            روش‌های پرداخت
          </LinkButton>
        }
      />
      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(p) => p.id}
        emptyMessage="تراکنشی ثبت نشده است."
      />
      <Pagination basePath="/payments" total={total} skip={skip} take={take} />
    </>
  );
}
