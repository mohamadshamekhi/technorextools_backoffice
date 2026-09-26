import type { Metadata } from "next";
import Link from "next/link";
import { Paperclip } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { warrantiesApi, guarded } from "@/lib/api";
import { REPAIR_STATUS_TONE, type RepairRequest } from "@/lib/api/backoffice/repair";
import {
  REPAIR_STATUSES,
  REPAIR_STATUS_LABELS,
  type RepairStatus,
} from "@/lib/api/backoffice/moderation";
import { parsePageParams } from "@/lib/pagination";
import { formatDate, formatNumber } from "@/lib/format";
import { RepairDetails } from "./repair-details";

export const metadata: Metadata = { title: "تعمیرات" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function isStatus(value: string | undefined): value is RepairStatus {
  return REPAIR_STATUSES.includes((value ?? "") as RepairStatus);
}

const columns: Column<RepairRequest>[] = [
  {
    key: "id",
    header: "شناسه",
    cell: (r) => (
      <span dir="ltr" className="font-mono text-xs" title={r.id}>
        {r.id.slice(-8)}
      </span>
    ),
  },
  {
    key: "customer",
    header: "مشتری",
    cell: (r) => (
      <div>
        <div>{r.user?.name ?? "بدون نام"}</div>
        {r.user?.mobile && (
          <div className="text-xs text-muted" dir="ltr">
            {r.user.mobile}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "warranty",
    header: "گارانتی",
    cell: (r) =>
      r.warranty?.serialNumber ? (
        <span dir="ltr" className="text-xs">
          {r.warranty.serialNumber}
        </span>
      ) : (
        <span className="text-muted">بدون گارانتی</span>
      ),
  },
  {
    key: "problem",
    header: "شرح مشکل",
    cell: (r) =>
      r.issueDescription ? (
        <p className="line-clamp-2 max-w-xs text-xs leading-6">{r.issueDescription}</p>
      ) : (
        <span className="text-muted">—</span>
      ),
  },
  {
    key: "attachments",
    header: "پیوست‌ها",
    cell: (r) =>
      r.attachments.length === 0 ? (
        <span className="text-muted">—</span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <Paperclip className="size-3.5" />
          {formatNumber(r.attachments.length)}
        </span>
      ),
  },
  { key: "date", header: "تاریخ", cell: (r) => formatDate(r.createdAt) },
  {
    key: "status",
    header: "وضعیت",
    cell: (r) => (
      <Badge tone={REPAIR_STATUS_TONE[r.status]}>
        {r.statusLabel || REPAIR_STATUS_LABELS[r.status]}
      </Badge>
    ),
  },
  {
    key: "actions",
    header: "",
    className: "w-px",
    cell: (r) => <RepairDetails repair={r} />,
  },
];

export default async function RepairsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { skip, take } = parsePageParams(sp);
  const rawStatus = typeof sp.status === "string" ? sp.status : undefined;
  const status = isStatus(rawStatus) ? rawStatus : undefined;

  const { items, total } = await guarded(warrantiesApi.listRepairs({ skip, take, status }));

  return (
    <>
      <PageHeader title="تعمیرات" description="درخواست‌های تعمیر دستگاه‌ها" />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/repairs"
          className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
            status === undefined
              ? "bg-primary text-primary-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          همه
        </Link>
        {REPAIR_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/repairs?status=${s}`}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              status === s
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {REPAIR_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(r) => r.id}
        emptyMessage="درخواست تعمیری در این وضعیت نیست."
      />
      <Pagination
        basePath="/repairs"
        params={{ status }}
        total={total}
        skip={skip}
        take={take}
      />
    </>
  );
}
