import type { Metadata } from "next";
import { Folder, FolderTree, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { categoriesApi } from "@/lib/api";
import type { CategoryTreeNode } from "@/lib/api/backoffice/categories";
import { formatDate, formatNumber } from "@/lib/format";
import { deleteCategoryAction } from "./actions";

export const metadata: Metadata = { title: "دسته‌بندی‌ها" };

type CategoryRow = { node: CategoryTreeNode; depth: number };

function flatten(nodes: CategoryTreeNode[], depth = 0): CategoryRow[] {
  return nodes.flatMap((node) => [
    { node, depth },
    ...flatten(node.children, depth + 1),
  ]);
}

const columns: Column<CategoryRow>[] = [
  {
    key: "logo",
    header: "تصویر",
    className: "w-px",
    cell: ({ node }) =>
      node.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={node.imageUrl}
          alt={`تصویر ${node.title}`}
          className="size-10 rounded-md border border-border object-contain bg-surface"
        />
      ) : (
        <div className="size-10 rounded-md border border-border bg-surface" />
      ),
  },
  {
    key: "title",
    header: "عنوان",
    cell: ({ node, depth }) => (
      <div
        className="flex min-w-0 items-center gap-2"
        style={{ paddingInlineStart: `${depth * 1.5}rem` }}
      >
        {depth === 0 ? (
          <FolderTree className="size-4 shrink-0 text-primary" />
        ) : (
          <Folder className="size-4 shrink-0 text-muted" />
        )}
        <span
          className={`truncate ${depth === 0 ? "font-semibold" : "text-foreground"}`}
        >
          {node.title}
        </span>
        {node.children.length > 0 && (
          <span className="shrink-0 text-xs text-muted">
            ({formatNumber(node.children.length)} زیردسته)
          </span>
        )}
      </div>
    ),
  },
  { key: "slug", header: "اسلاگ", cell: ({ node }) => <span dir="ltr">{node.slug}</span> },
  {
    key: "status",
    header: "وضعیت",
    cell: ({ node }) =>
      node.isActive ? (
        <Badge tone="success">فعال</Badge>
      ) : (
        <Badge tone="neutral">غیرفعال</Badge>
      ),
  },
  { key: "createdAt", header: "تاریخ ایجاد", cell: ({ node }) => formatDate(node.createdAt) },
  {
    key: "actions",
    header: "عملیات",
    className: "w-px",
    cell: ({ node }) => (
      <RowActionsMenu
        viewHref={`/categories/${node.id}`}
        editHref={`/categories/${node.id}`}
        onDelete={deleteCategoryAction.bind(null, node.id)}
      />
    ),
  },
];

export default async function CategoriesPage() {
  const tree = await categoriesApi.tree();
  const rows = flatten(tree);

  return (
    <>
      <PageHeader
        title="دسته‌بندی‌ها"
        description="ساختار درختی دسته‌های محصولات"
        actions={
          <LinkButton href="/categories/new">
            <Plus className="size-4" />
            دسته جدید
          </LinkButton>
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.node.id}
        emptyMessage="دسته‌ای ثبت نشده است."
      />
    </>
  );
}
