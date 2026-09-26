"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/ui/error-view";

/** مرز خطای مشترک همه‌ی صفحات داشبورد (شل و منو حفظ می‌شود) */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorView onRetry={reset} />;
}
