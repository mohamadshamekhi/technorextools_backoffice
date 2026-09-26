import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import Link from "next/link";
import { contactApi, guarded } from "@/lib/api";
import {
  CONTACT_MESSAGE_STATUSES,
  CONTACT_MESSAGE_STATUS_LABELS,
  type ContactMessageStatus,
} from "@/lib/api/backoffice/moderation";
import type { ContactMessage } from "@/lib/api/backoffice/contact";
import { parsePageParams } from "@/lib/pagination";
import { formatDateTime } from "@/lib/format";
import { ContactStatusButtons } from "./status-buttons";

export const metadata: Metadata = { title: "پیام‌های تماس" };

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const STATUS_TONE: Record<ContactMessageStatus, BadgeTone> = {
  new: "warning",
  handled: "success",
};

function isStatus(value: string | undefined): value is ContactMessageStatus {
  return CONTACT_MESSAGE_STATUSES.includes((value ?? "") as ContactMessageStatus);
}

const columns: Column<ContactMessage>[] = [
  {
    key: "sender",
    header: "فرستنده",
    cell: (m) => (
      <div>
        <div>{m.name}</div>
        <div className="text-xs text-muted" dir="ltr">
          {m.phone}
        </div>
      </div>
    ),
  },
  { key: "subject", header: "موضوع", cell: (m) => m.subject ?? "—" },
  {
    key: "message",
    header: "متن پیام",
    cell: (m) => <p className="max-w-md whitespace-pre-wrap">{m.message}</p>,
  },
  { key: "date", header: "تاریخ", cell: (m) => formatDateTime(m.createdAt) },
  {
    key: "status",
    header: "وضعیت",
    cell: (m) => (
      <Badge tone={STATUS_TONE[m.status]}>
        {CONTACT_MESSAGE_STATUS_LABELS[m.status]}
      </Badge>
    ),
  },
  {
    key: "actions",
    header: "اقدام",
    cell: (m) => <ContactStatusButtons messageId={m.id} status={m.status} />,
  },
];

export default async function ContactMessagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { skip, take } = parsePageParams(sp);
  const raw = typeof sp.status === "string" ? sp.status : undefined;
  const status: ContactMessageStatus | undefined = isStatus(raw) ? raw : undefined;

  const { items, total } = await guarded(contactApi.list({ skip, take, status }));

  return (
    <>
      <PageHeader
        title="پیام‌های تماس"
        description="پیام‌های ثبت‌شده از فرم تماس با ما"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/contact-messages"
          className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
            status === undefined
              ? "bg-primary text-primary-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          همه
        </Link>
        {CONTACT_MESSAGE_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/contact-messages?status=${s}`}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              status === s
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {CONTACT_MESSAGE_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={items}
        getRowKey={(m) => m.id}
        emptyMessage="پیامی در این وضعیت نیست."
      />
      <Pagination
        basePath="/contact-messages"
        params={{ status }}
        total={total}
        skip={skip}
        take={take}
      />
    </>
  );
}
