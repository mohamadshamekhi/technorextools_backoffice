import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { productQuestionsApi, guarded } from "@/lib/api";
import {
  PRODUCT_QUESTION_STATUSES,
  PRODUCT_QUESTION_STATUS_LABELS,
  type ProductQuestionStatus,
} from "@/lib/api/backoffice/moderation";
import type { ProductQuestion } from "@/lib/api/backoffice/product-questions";
import { parsePageParams } from "@/lib/pagination";
import { formatDate } from "@/lib/format";
import { QuestionActions } from "./question-actions";

export const metadata: Metadata = { title: "پرسش‌های محصول" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const STATUS_TONE: Record<ProductQuestionStatus, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

function isStatus(value: string | undefined): value is ProductQuestionStatus {
  return PRODUCT_QUESTION_STATUSES.includes((value ?? "") as ProductQuestionStatus);
}

const columns: Column<ProductQuestion>[] = [
  {
    key: "question",
    header: "پرسش",
    cell: (q) => <p className="max-w-sm whitespace-pre-wrap">{q.question}</p>,
  },
  {
    key: "product",
    header: "محصول",
    cell: (q) =>
      q.product ? (
        <Link href={`/products/${q.product.id}`} className="text-primary hover:underline">
          {q.product.title}
        </Link>
      ) : (
        "—"
      ),
  },
  { key: "author", header: "پرسشگر", cell: (q) => q.author?.fullName ?? "—" },
  { key: "date", header: "تاریخ", cell: (q) => formatDate(q.createdAt) },
  {
    key: "status",
    header: "وضعیت",
    cell: (q) => (
      <Badge tone={STATUS_TONE[q.status]}>
        {PRODUCT_QUESTION_STATUS_LABELS[q.status]}
      </Badge>
    ),
  },
  {
    key: "actions",
    header: "پاسخ",
    cell: (q) => (
      <QuestionActions questionId={q.id} status={q.status} initialAnswer={q.answer} />
    ),
  },
];

export default async function ProductQuestionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { skip, take } = parsePageParams(sp);
  const raw = typeof sp.status === "string" ? sp.status : "pending";
  const status: ProductQuestionStatus = isStatus(raw) ? raw : "pending";

  const { items, total } = await guarded(
    productQuestionsApi.list({ skip, take, status }),
  );

  return (
    <>
      <PageHeader
        title="پرسش‌های محصول"
        description="پاسخ به پرسش‌های کاربران درباره‌ی محصولات؛ ثبت پاسخ، پرسش را منتشر می‌کند."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {PRODUCT_QUESTION_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/product-questions?status=${s}`}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              status === s
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {PRODUCT_QUESTION_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(q) => q.id}
        emptyMessage="پرسشی در این وضعیت نیست."
      />
      <Pagination
        basePath="/product-questions"
        params={{ status }}
        total={total}
        skip={skip}
        take={take}
      />
    </>
  );
}
