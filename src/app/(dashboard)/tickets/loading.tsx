import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader title="تیکت‌ها" description="تیکت‌های پشتیبانی مشتریان" />
      <TableSkeleton />
    </>
  );
}
