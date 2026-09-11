import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { contentApi } from "@/lib/api";
import type { BackofficeArticle } from "@/lib/api/backoffice/content";
import { parsePageParams } from "@/lib/pagination";
import { formatDate } from "@/lib/format";
import { deleteArticleAction } from "./actions";

export const metadata: Metadata = { title: "مقالات" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const columns: Column<BackofficeArticle>[] = [
  { key: "title", header: "عنوان", cell: (a) => a.title },
  { key: "slug", header: "اسلاگ", cell: (a) => <span dir="ltr">{a.slug}</span> },
  {
    key: "status",
    header: "وضعیت",
    cell: (a) =>
      a.publishedAt ? (
        <Badge tone="success">منتشرشده</Badge>
      ) : (
        <Badge tone="neutral">پیش‌نویس</Badge>
      ),
  },
  {
    key: "publishedAt",
    header: "تاریخ انتشار",
    cell: (a) => (a.publishedAt ? formatDate(a.publishedAt) : "—"),
  },
  {
    key: "actions",
    header: "عملیات",
    className: "w-px",
    cell: (a) => (
      <RowActionsMenu
        viewHref={`/articles/${a.id}`}
        editHref={`/articles/${a.id}`}
        onDelete={deleteArticleAction.bind(null, a.id)}
      />
    ),
  },
];

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { skip, take } = parsePageParams(sp);
  const { items, total } = await contentApi.listArticles({ skip, take });

  return (
    <>
      <PageHeader
        title="مقالات"
        description="مقالات و راهنماهای وبلاگ"
        actions={
          <LinkButton href="/articles/new">
            <Plus className="size-4" />
            مقاله جدید
          </LinkButton>
        }
      />
      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(a) => a.id}
        emptyMessage="مقاله‌ای ثبت نشده است."
      />
      <Pagination basePath="/articles" total={total} skip={skip} take={take} />
    </>
  );
}
