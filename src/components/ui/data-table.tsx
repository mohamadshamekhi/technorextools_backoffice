import type { ReactNode } from "react";

/**
 * جدول داده‌ی سبک و تایپ‌شده. Server Component — بدون state.
 * ستون‌ها را تعریف کنید و ردیف‌ها را بدهید؛ حالت خالی داخلی دارد.
 */

export type Column<T> = {
  /** کلید یکتای ستون */
  key: string;
  header: ReactNode;
  /** رندر سلول برای هر ردیف */
  cell: (row: T) => ReactNode;
  /** کلاس اضافی سلول/هدر (مثلاً text-end برای اعداد) */
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyMessage = "موردی برای نمایش نیست.",
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-surface">
      <table className="w-full min-w-[40rem] text-sm">
        <thead>
          <tr className="border-b text-muted">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-start font-medium ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="border-b last:border-0 transition-colors hover:bg-border/30"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${col.className ?? ""}`}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
