import type { Metadata } from "next";
import { Folder, FolderTree, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { categoriesApi } from "@/lib/api";
import type { CategoryTreeNode } from "@/lib/api/backoffice/categories";
import { deleteCategoryAction } from "./actions";

export const metadata: Metadata = { title: "دسته‌بندی‌ها" };

function countAll(nodes: CategoryTreeNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countAll(n.children), 0);
}

function TreeRows({
  nodes,
  depth = 0,
}: {
  nodes: CategoryTreeNode[];
  depth?: number;
}) {
  return (
    <>
      {nodes.map((node) => (
        <div key={node.id}>
          <div
            className="group flex items-center justify-between gap-3 rounded-lg py-2.5 pe-1.5 transition-colors hover:bg-border/30"
            style={{
              paddingInlineStart: `${0.75 + depth * 1.5}rem`,
              borderInlineStart: depth > 0 ? "1px solid var(--border)" : undefined,
              marginInlineStart: depth > 0 ? "1.4rem" : undefined,
            }}
          >
            <span className="flex min-w-0 items-center gap-2">
              {depth === 0 ? (
                <FolderTree className="size-4 shrink-0 text-primary" />
              ) : (
                <Folder className="size-4 shrink-0 text-muted" />
              )}
              <span
                className={`truncate text-sm ${depth === 0 ? "font-semibold" : "text-foreground"}`}
              >
                {node.title}
              </span>
              {!node.isActive && <Badge tone="neutral">غیرفعال</Badge>}
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="hidden text-xs text-muted sm:inline" dir="ltr">
                {node.slug}
              </span>
              <RowActionsMenu
                viewHref={`/categories/${node.id}`}
                editHref={`/categories/${node.id}`}
                onDelete={deleteCategoryAction.bind(null, node.id)}
              />
            </span>
          </div>
          {node.children.length > 0 && (
            <TreeRows nodes={node.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </>
  );
}

export default async function CategoriesPage() {
  const tree = await categoriesApi.tree();
  const total = countAll(tree);

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
      {tree.length === 0 ? (
        <EmptyState
          title="دسته‌ای ثبت نشده است"
          description="با دکمه «دسته جدید» اولین دسته را بسازید."
        />
      ) : (
        <Card
          title={`${total} دسته`}
          action={
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <FolderTree className="size-3.5 text-primary" />
              اصلی
              <Folder className="size-3.5 text-muted" />
              زیردسته
            </span>
          }
        >
          <div className="-my-1">
            <TreeRows nodes={tree} />
          </div>
        </Card>
      )}
    </>
  );
}
