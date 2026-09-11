import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { accessApi } from "@/lib/api";
import type { BackofficeRole } from "@/lib/api/backoffice/access";
import { formatNumber } from "@/lib/format";
import { deleteRoleAction } from "./actions";

export const metadata: Metadata = { title: "نقش‌ها و دسترسی" };

const columns: Column<BackofficeRole>[] = [
  { key: "title", header: "نقش", cell: (r) => r.title },
  { key: "slug", header: "اسلاگ", cell: (r) => <span dir="ltr">{r.slug}</span> },
  {
    key: "users",
    header: "کاربران",
    className: "tabular-nums",
    cell: (r) => formatNumber(r.userCount),
  },
  {
    key: "perms",
    header: "دسترسی‌ها",
    className: "tabular-nums",
    cell: (r) => formatNumber(r.permissions.length),
  },
  {
    key: "system",
    header: "نوع",
    cell: (r) =>
      r.isSystem ? (
        <Badge tone="info">سیستمی</Badge>
      ) : (
        <Badge tone="neutral">سفارشی</Badge>
      ),
  },
  {
    key: "actions",
    header: "عملیات",
    className: "w-px",
    cell: (r) => (
      <RowActionsMenu
        viewHref={`/roles/${r.id}`}
        editHref={`/roles/${r.id}`}
        onDelete={r.isSystem ? undefined : deleteRoleAction.bind(null, r.id)}
      />
    ),
  },
];

export default async function RolesPage() {
  const roles = await accessApi.listRoles();

  return (
    <>
      <PageHeader
        title="نقش‌ها و دسترسی"
        description="نقش‌های کاربری و مجموعه دسترسی‌های هرکدام"
        actions={
          <LinkButton href="/roles/new">
            <Plus className="size-4" />
            نقش جدید
          </LinkButton>
        }
      />
      <DataTable
        columns={columns}
        rows={roles}
        getRowKey={(r) => r.id}
        emptyMessage="نقشی تعریف نشده است."
      />
    </>
  );
}
