import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader
        title="نقش‌ها و دسترسی"
        description="نقش‌های کاربری و مجموعه دسترسی‌های هرکدام"
      />
      <TableSkeleton />
    </>
  );
}
