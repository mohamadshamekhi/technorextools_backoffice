import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader
        title="روش‌های پرداخت"
        description="افزودن، ویرایش و حذف روش‌های پرداخت"
      />
      <TableSkeleton rows={3} />
    </>
  );
}
