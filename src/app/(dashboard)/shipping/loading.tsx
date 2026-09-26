import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader
        title="روش‌های ارسال"
        description="روش‌ها و هزینه‌های ارسال سفارش"
      />
      <TableSkeleton />
    </>
  );
}
