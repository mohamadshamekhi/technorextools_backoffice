import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { contentApi } from "@/lib/api";
import type { BackofficeBranch } from "@/lib/api/backoffice/content";
import { deleteBranchAction } from "./actions";

export const metadata: Metadata = { title: "شعب" };

const columns: Column<BackofficeBranch>[] = [
  { key: "title", header: "عنوان", cell: (b) => b.title },
  { key: "address", header: "آدرس", cell: (b) => b.address },
  { key: "phone", header: "تلفن", cell: (b) => <span dir="ltr">{b.phone}</span> },
  {
    key: "wholesale",
    header: "نوع",
    cell: (b) =>
      b.isWholesalePoint ? <Badge tone="info">عمده</Badge> : <span className="text-muted">خرده</span>,
  },
  {
    key: "actions",
    header: "عملیات",
    className: "w-px",
    cell: (b) => (
      <RowActionsMenu
        viewHref={`/branches/${b.id}`}
        editHref={`/branches/${b.id}`}
        onDelete={deleteBranchAction.bind(null, b.id)}
      />
    ),
  },
];

export default async function BranchesPage() {
  const branches = await contentApi.listBranches();

  return (
    <>
      <PageHeader
        title="شعب"
        description="شعب و نقاط فروش فروشگاه"
        actions={
          <LinkButton href="/branches/new">
            <Plus className="size-4" />
            شعبه جدید
          </LinkButton>
        }
      />
      <DataTable
        columns={columns}
        rows={branches}
        getRowKey={(b) => b.id}
        emptyMessage="شعبه‌ای ثبت نشده است."
      />
    </>
  );
}
