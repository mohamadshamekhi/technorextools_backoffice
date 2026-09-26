import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { inventoryApi } from "@/lib/api";
import { BundleForm } from "../bundle-form";

export const metadata: Metadata = { title: "پکیج جدید" };

export default async function NewBundlePage() {
  // سقف واقعی take در listInventoryVariantsQuerySchema بک‌اند ۱۰۰ است؛ عدد بزرگ‌تر ۴۰۰ می‌دهد.
  const { items: variants } = await inventoryApi.list({ take: 100 });

  return (
    <>
      <PageHeader
        title="پکیج جدید"
        actions={
          <LinkButton href="/bundles" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card>
        <BundleForm variants={variants} />
      </Card>
    </>
  );
}
