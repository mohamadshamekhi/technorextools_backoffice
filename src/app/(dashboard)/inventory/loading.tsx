import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader
        title="انبار"
        description="ویرایش سریع موجودی و قیمت تنوع‌های محصول"
      />
      <TableSkeleton />
    </>
  );
}
