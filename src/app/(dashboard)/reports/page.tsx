import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { reportsApi } from "@/lib/api";
import type { AdminLog } from "@/lib/api/backoffice/reports";
import { formatDate, formatDateTime, formatNumber, formatToman } from "@/lib/format";
import { ReportRangeForm } from "./report-range-form";

export const metadata: Metadata = { title: "گزارش‌ها" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

const logColumns: Column<AdminLog>[] = [
  { key: "actor", header: "کاربر", cell: (l) => l.actor },
  { key: "action", header: "اقدام", cell: (l) => <span dir="ltr">{l.action}</span> },
  {
    key: "entity",
    header: "موجودیت",
    cell: (l) => (
      <span dir="ltr">
        {l.entityType}
        {l.entityId ? `/${l.entityId}` : ""}
      </span>
    ),
  },
  { key: "date", header: "زمان", cell: (l) => formatDateTime(l.createdAt) },
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const def = defaultRange();
  const from = typeof sp.from === "string" ? sp.from : def.from;
  const to = typeof sp.to === "string" ? sp.to : def.to;

  const [sales, inventory, logs] = await Promise.allSettled([
    reportsApi.sales({ from, to }),
    reportsApi.inventory(5),
    reportsApi.adminLogs({ take: 50 }),
  ]);

  return (
    <>
      <PageHeader title="گزارش‌ها" description="فروش، موجودی و لاگ اقدامات مدیران" />

      <div className="space-y-6">
        <Card title="گزارش فروش">
          <ReportRangeForm from={from} to={to} />
          {sales.status === "fulfilled" ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Stat label="درآمد کل" value={formatToman(sales.value.totalRevenue)} />
              <Stat
                label="تعداد سفارش"
                value={formatNumber(sales.value.orderCount)}
              />
              <Stat
                label="میانگین ارزش سفارش"
                value={formatToman(sales.value.averageOrderValue)}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-danger">گزارش فروش در دسترس نیست.</p>
          )}
          {sales.status === "fulfilled" && (sales.value.daily?.length ?? 0) > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[24rem] text-sm">
                <thead>
                  <tr className="border-b text-muted">
                    <th className="px-3 py-2 text-start font-medium">تاریخ</th>
                    <th className="px-3 py-2 text-start font-medium">درآمد</th>
                    <th className="px-3 py-2 text-start font-medium">سفارش</th>
                  </tr>
                </thead>
                <tbody>
                  {(sales.value.daily ?? []).map((d) => (
                    <tr key={d.date} className="border-b last:border-0">
                      <td className="px-3 py-2">{formatDate(d.date)}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {formatToman(d.revenue)}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {formatNumber(d.orders)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="کالاهای کم‌موجودی">
          {inventory.status === "fulfilled" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[24rem] text-sm">
                <thead>
                  <tr className="border-b text-muted">
                    <th className="px-3 py-2 text-start font-medium">محصول</th>
                    <th className="px-3 py-2 text-start font-medium">SKU</th>
                    <th className="px-3 py-2 text-start font-medium">موجودی</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.value.items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-8 text-center text-muted">
                        همه کالاها موجودی کافی دارند.
                      </td>
                    </tr>
                  ) : (
                    inventory.value.items.map((r) => (
                      <tr key={r.variantId} className="border-b last:border-0">
                        <td className="px-3 py-2">{r.productTitle}</td>
                        <td className="px-3 py-2" dir="ltr">
                          {r.sku}
                        </td>
                        <td className="px-3 py-2 tabular-nums text-danger">
                          {formatNumber(r.stockQty)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-danger">گزارش موجودی در دسترس نیست.</p>
          )}
        </Card>

        <Card title="لاگ اقدامات مدیران">
          {logs.status === "fulfilled" ? (
            <DataTable
              columns={logColumns}
              rows={logs.value.items}
              getRowKey={(l) => l.id}
              emptyMessage="لاگی ثبت نشده است."
            />
          ) : (
            <p className="text-sm text-danger">لاگ‌ها در دسترس نیست.</p>
          )}
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
