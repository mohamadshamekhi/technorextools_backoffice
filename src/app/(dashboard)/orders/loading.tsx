import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader title="سفارش‌ها" description="سفارش‌های ثبت‌شده در فروشگاه" />
      <TableSkeleton />
    </>
  );
}
