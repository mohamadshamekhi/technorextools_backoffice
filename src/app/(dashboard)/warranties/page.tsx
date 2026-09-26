import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchField } from "@/components/ui/search-field";
import { warrantiesApi } from "@/lib/api";
import type { OrderWarranty } from "@/lib/api/backoffice/warranties";
import { formatDate } from "@/lib/format";
import { IssueWarrantyForm } from "./issue-warranty-form";

export const metadata: Metadata = { title: "گارانتی‌ها" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const columns: Column<OrderWarranty>[] = [
  {
    key: "serial",
    header: "شماره سریال",
    cell: (w) => <span dir="ltr">{w.serialNumber}</span>,
  },
  { key: "product", header: "محصول", cell: (w) => w.productTitle ?? "—" },
  { key: "starts", header: "شروع", cell: (w) => formatDate(w.startsAt) },
  { key: "ends", header: "پایان", cell: (w) => formatDate(w.endsAt) },
  { key: "created", header: "صدور", cell: (w) => formatDate(w.createdAt) },
];

export default async function WarrantiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const orderId = typeof sp.orderId === "string" ? sp.orderId : undefined;

  const warranties = orderId
    ? await warrantiesApi.listWarranties(orderId).catch(() => [])
    : [];

  return (
    <>
      <PageHeader
        title="گارانتی‌ها"
        description="گارانتی‌های صادرشده برای اقلام سفارش"
        actions={
          <SearchField placeholder="شناسه سفارش…" paramName="orderId" />
        }
      />

      {!orderId ? (
        <EmptyState
          title="شناسه سفارش را وارد کنید"
          description="برای دیدن و صدور گارانتی، شناسه سفارش (orderId) را در کادر بالا وارد کنید."
        />
      ) : (
        <div className="space-y-4">
          <Card title="گارانتی‌های این سفارش">
            <DataTable
              columns={columns}
              rows={warranties}
              getRowKey={(w) => w.id}
              emptyMessage="گارانتی‌ای برای این سفارش صادر نشده است."
            />
          </Card>
          <Card title="صدور گارانتی جدید">
            <IssueWarrantyForm orderId={orderId} />
          </Card>
        </div>
      )}
    </>
  );
}
