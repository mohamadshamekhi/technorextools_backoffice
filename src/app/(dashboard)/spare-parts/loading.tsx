import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader title="قطعات یدکی" description="قطعات یدکی قابل فروش مستقل از محصولات" />
      <TableSkeleton />
    </>
  );
}
