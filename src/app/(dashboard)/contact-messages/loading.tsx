import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader
        title="پیام‌های تماس"
        description="پیام‌های ثبت‌شده از فرم تماس با ما"
      />
      <TableSkeleton />
    </>
  );
}
