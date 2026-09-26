import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { SearchField } from "@/components/ui/search-field";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { usersApi, guarded } from "@/lib/api";
import type { BackofficeUser } from "@/lib/api/backoffice/users";
import { parsePageParams } from "@/lib/pagination";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "کاربران" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const columns: Column<BackofficeUser>[] = [
  { key: "name", header: "نام", cell: (u) => u.fullName ?? "بدون نام" },
  {
    key: "mobile",
    header: "موبایل",
    cell: (u) => (
      <span dir="ltr" className="tabular-nums">
        {u.mobile}
      </span>
    ),
  },
  { key: "role", header: "نقش", cell: (u) => u.role?.title ?? "—" },
  {
    key: "status",
    header: "وضعیت",
    cell: (u) =>
      u.isActive ? (
        <Badge tone="success">فعال</Badge>
      ) : (
        <Badge tone="danger">غیرفعال</Badge>
      ),
  },
  {
    key: "createdAt",
    header: "تاریخ ثبت‌نام",
    cell: (u) => formatDate(u.createdAt),
  },
  {
    key: "actions",
    header: "عملیات",
    className: "w-px",
    cell: (u) => (
      <RowActionsMenu viewHref={`/users/${u.id}`} editHref={`/users/${u.id}`} />
    ),
  },
];

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { skip, take } = parsePageParams(sp);
  const search = typeof sp.search === "string" ? sp.search : undefined;

  const { items, total } = await guarded(usersApi.list({ skip, take, search }));

  return (
    <>
      <PageHeader
        title="کاربران"
        description="کاربران ثبت‌نام‌شده در وبسایت"
        actions={<SearchField placeholder="نام یا شماره موبایل…" />}
      />

      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(u) => u.id}
        emptyMessage="کاربری با این مشخصات یافت نشد."
      />

      <Pagination
        basePath="/users"
        params={{ search }}
        total={total}
        skip={skip}
        take={take}
      />
    </>
  );
}
