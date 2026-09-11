import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import type { BadgeTone } from "@/components/ui/badge";
import { commentsApi } from "@/lib/api";
import {
  COMMENT_STATUSES,
  COMMENT_STATUS_LABELS,
  type CommentStatus,
} from "@/lib/api/backoffice/moderation";
import type { BackofficeComment } from "@/lib/api/backoffice/comments";
import { formatDate } from "@/lib/format";
import { ModerationButtons } from "./moderation-buttons";

export const metadata: Metadata = { title: "نظرات" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const STATUS_TONE: Record<CommentStatus, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

function isStatus(v: string | undefined): v is CommentStatus {
  return COMMENT_STATUSES.includes((v ?? "") as CommentStatus);
}

const columns: Column<BackofficeComment>[] = [
  {
    key: "body",
    header: "متن نظر",
    cell: (c) => <p className="max-w-md whitespace-pre-wrap">{c.body}</p>,
  },
  { key: "author", header: "نویسنده", cell: (c) => c.authorName ?? "—" },
  {
    key: "product",
    header: "محصول",
    cell: (c) =>
      c.productId ? (
        <Link
          href={`/products/${c.productId}`}
          className="text-primary hover:underline"
        >
          {c.productTitle ?? "محصول"}
        </Link>
      ) : (
        "—"
      ),
  },
  { key: "date", header: "تاریخ", cell: (c) => formatDate(c.createdAt) },
  {
    key: "status",
    header: "وضعیت",
    cell: (c) => (
      <Badge tone={STATUS_TONE[c.status]}>
        {COMMENT_STATUS_LABELS[c.status]}
      </Badge>
    ),
  },
  {
    key: "actions",
    header: "اقدام",
    cell: (c) => <ModerationButtons commentId={c.id} status={c.status} />,
  },
];

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "pending";
  const activeStatus: CommentStatus | undefined = isStatus(status)
    ? status
    : undefined;

  const comments = await commentsApi.list(activeStatus);

  return (
    <>
      <PageHeader
        title="نظرات"
        description="بررسی و مدیریت نظرات کاربران"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {COMMENT_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/comments?status=${s}`}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              activeStatus === s
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {COMMENT_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={comments}
        getRowKey={(c) => c.id}
        emptyMessage="نظری در این وضعیت نیست."
      />
    </>
  );
}
