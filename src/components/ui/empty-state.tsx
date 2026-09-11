import { Inbox } from "lucide-react";

/**
 * حالت خالی پیش‌فرض صفحات.
 * وقتی داده یا جدول واقعی اضافه کردید، این کامپوننت رو با محتوای اصلی جایگزین کنید.
 */
export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-surface px-6 py-16 text-center">
      <Inbox className="mb-4 size-10 text-muted" />
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </div>
  );
}
