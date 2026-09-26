import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader title="نظرات" description="بررسی و مدیریت نظرات کاربران" />
      <TableSkeleton />
    </>
  );
}
