import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import type { BadgeTone } from "@/components/ui/badge";
import { ticketsApi } from "@/lib/api";
import {
  TICKET_STATUS_LABELS,
  type TicketStatus,
} from "@/lib/api/backoffice/moderation";
import type { BackofficeTicket } from "@/lib/api/backoffice/tickets";
import { parsePageParams } from "@/lib/pagination";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "تیکت‌ها" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const STATUS_TONE: Record<TicketStatus, BadgeTone> = {
  open: "info",
  answered: "success",
  closed: "neutral",
};

const columns: Column<BackofficeTicket>[] = [
  {
    key: "subject",
    header: "موضوع",
    cell: (t) => (
      <Link
        href={`/tickets/${t.id}`}
        className="font-medium text-primary hover:underline"
      >
        {t.subject}
      </Link>
    ),
  },
  {
    key: "customer",
    header: "مشتری",
    cell: (t) => t.customer.fullName ?? t.customer.mobile,
  },
  {
    key: "status",
    header: "وضعیت",
    cell: (t) => (
      <Badge tone={STATUS_TONE[t.status]}>
        {TICKET_STATUS_LABELS[t.status]}
      </Badge>
    ),
  },
  {
    key: "last",
    header: "آخرین پیام",
    cell: (t) => formatDateTime(t.lastMessageAt),
  },
];

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { skip, take } = parsePageParams(sp);
  const { items, total } = await ticketsApi.list({ skip, take });

  return (
    <>
      <PageHeader title="تیکت‌ها" description="تیکت‌های پشتیبانی مشتریان" />
      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(t) => t.id}
        emptyMessage="تیکتی ثبت نشده است."
      />
      <Pagination basePath="/tickets" total={total} skip={skip} take={take} />
    </>
  );
}
