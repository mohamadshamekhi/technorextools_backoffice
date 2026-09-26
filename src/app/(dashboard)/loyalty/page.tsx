import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { loyaltyApi, ApiError } from "@/lib/api";
import type { LoyaltyTransaction } from "@/lib/api/backoffice/loyalty";
import { parsePageParams } from "@/lib/pagination";
import { formatDateTime, formatNumber } from "@/lib/format";
import { AdjustPointsForm } from "./adjust-points-form";

export const metadata: Metadata = { title: "باشگاه مشتریان" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const columns: Column<LoyaltyTransaction>[] = [
  {
    key: "points",
    header: "امتیاز",
    className: "tabular-nums",
    cell: (t) => (
      <span className={t.points >= 0 ? "text-success" : "text-danger"}>
        {t.points >= 0 ? "+" : ""}
        {formatNumber(t.points)}
      </span>
    ),
  },
  { key: "reason", header: "علت", cell: (t) => t.reason },
  { key: "note", header: "یادداشت", cell: (t) => t.note ?? "—" },
  { key: "date", header: "زمان", cell: (t) => formatDateTime(t.createdAt) },
];

export default async function LoyaltyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const userId = typeof sp.userId === "string" ? sp.userId : undefined;
  const { skip, take } = parsePageParams(sp);

  let summary = null;
  let error: string | null = null;
  if (userId) {
    try {
      summary = await loyaltyApi.get(userId, { skip, take });
    } catch (e) {
      error =
        e instanceof ApiError ? e.displayMessage : "دریافت اطلاعات ناموفق بود.";
    }
  }

  return (
    <>
      <PageHeader
        title="باشگاه مشتریان"
        description="مشاهده و تعدیل امتیاز کاربران"
        actions={<SearchField placeholder="شناسه کاربر…" paramName="userId" />}
      />

      {!userId && (
        <EmptyState
          title="شناسه کاربر را وارد کنید"
          description="برای مشاهده امتیاز و سابقه، شناسه کاربر (userId) را در کادر بالا وارد کنید."
        />
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      {summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-sm text-muted">موجودی امتیاز</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">
                {formatNumber(summary.balance)}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-muted">مجموع کسب‌شده</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">
                {formatNumber(summary.totalEarned)}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-muted">مجموع مصرف‌شده</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">
                {formatNumber(summary.totalSpent)}
              </p>
            </Card>
          </div>

          <Card title="تعدیل امتیاز">
            <AdjustPointsForm userId={summary.userId} />
          </Card>

          <Card title="سابقه تراکنش‌ها">
            <DataTable
              columns={columns}
              rows={summary.transactions.items}
              getRowKey={(t) => t.id}
              emptyMessage="تراکنشی ثبت نشده است."
            />
            <Pagination
              basePath="/loyalty"
              params={{ userId: summary.userId }}
              total={summary.transactions.total}
              skip={skip}
              take={take}
            />
          </Card>
        </div>
      )}
    </>
  );
}
