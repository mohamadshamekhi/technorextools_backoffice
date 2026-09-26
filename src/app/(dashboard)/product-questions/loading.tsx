import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader
        title="پرسش‌های محصول"
        description="پاسخ به پرسش‌های کاربران درباره‌ی محصولات؛ ثبت پاسخ، پرسش را منتشر می‌کند."
      />
      <TableSkeleton />
    </>
  );
}
