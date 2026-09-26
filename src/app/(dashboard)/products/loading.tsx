import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader title="محصولات" description="کاتالوگ محصولات فروشگاه" />
      <TableSkeleton />
    </>
  );
}
