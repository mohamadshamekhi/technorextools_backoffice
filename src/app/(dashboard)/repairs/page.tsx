import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { warrantiesApi } from "@/lib/api";
import type { RepairRequest } from "@/lib/api/backoffice/warranties";
import { parsePageParams } from "@/lib/pagination";
import { formatDate } from "@/lib/format";
import { RepairStatusSelect } from "./repair-status-select";

export const metadata: Metadata = { title: "تعمیرات" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const columns: Column<RepairRequest>[] = [
  {
    key: "code",
    header: "کد پیگیری",
    cell: (r) => <span dir="ltr">{r.trackingCode}</span>,
  },
  {
    key: "customer",
    header: "مشتری",
    cell: (r) => (
      <div>
        <div>{r.customerName ?? "—"}</div>
        <div className="text-xs text-muted" dir="ltr">
          {r.customerMobile}
        </div>
      </div>
    ),
  },
  { key: "device", header: "دستگاه", cell: (r) => r.deviceTitle },
  {
    key: "problem",
    header: "شرح مشکل",
    cell: (r) => (
      <p className="max-w-xs whitespace-pre-wrap text-xs">
        {r.problemDescription}
      </p>
    ),
  },
  { key: "date", header: "تاریخ", cell: (r) => formatDate(r.createdAt) },
  {
    key: "status",
    header: "وضعیت",
    cell: (r) => <RepairStatusSelect repairId={r.id} status={r.status} />,
  },
];

export default async function RepairsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { skip, take } = parsePageParams(sp);
  const { items, total } = await warrantiesApi.listRepairs({ skip, take });

  return (
    <>
      <PageHeader
        title="تعمیرات"
        description="درخواست‌های تعمیر دستگاه‌ها"
      />
      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(r) => r.id}
        emptyMessage="درخواست تعمیری ثبت نشده است."
      />
      <Pagination basePath="/repairs" total={total} skip={skip} take={take} />
    </>
  );
}
