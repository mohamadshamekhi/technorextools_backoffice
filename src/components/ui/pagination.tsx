import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { formatNumber } from "@/lib/format";

/**
 * صفحه‌بندی مبتنی بر skip/take روی query string. Server Component.
 * جهت RTL: «قبلی» با فلش راست، «بعدی» با فلش چپ.
 */

export function Pagination({
  basePath,
  params,
  total,
  skip,
  take,
}: {
  /** مسیر صفحه بدون query (مثلاً "/users") */
  basePath: string;
  /** بقیه‌ی پارامترهای فعلی که باید حفظ شوند (بدون skip) */
  params?: Record<string, string | undefined>;
  total: number;
  skip: number;
  take: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / take));
  const currentPage = Math.floor(skip / take) + 1;
  if (totalPages <= 1) return null;

  const hrefFor = (page: number): string => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value) search.set(key, value);
    }
    const nextSkip = (page - 1) * take;
    if (nextSkip > 0) search.set("skip", String(nextSkip));
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
      <p className="text-muted">
        صفحه {formatNumber(currentPage)} از {formatNumber(totalPages)} —{" "}
        {formatNumber(total)} مورد
      </p>

      <div className="flex items-center gap-2">
        <PagerLink href={hrefFor(currentPage - 1)} disabled={!hasPrev}>
          <ChevronRight className="size-4" />
          قبلی
        </PagerLink>
        <PagerLink href={hrefFor(currentPage + 1)} disabled={!hasNext}>
          بعدی
          <ChevronLeft className="size-4" />
        </PagerLink>
      </div>
    </div>
  );
}

function PagerLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const className =
    "flex items-center gap-1 rounded-lg border px-3 py-1.5 transition-colors";
  if (disabled) {
    return (
      <span className={`${className} cursor-not-allowed text-muted opacity-50`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={`${className} hover:bg-border/40`}>
      {children}
    </Link>
  );
}
