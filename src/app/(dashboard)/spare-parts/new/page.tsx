import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { productsApi } from "@/lib/api";
import { SparePartForm } from "../spare-part-form";

export const metadata: Metadata = { title: "قطعه جدید" };

export default async function NewSparePartPage() {
  const products = await productsApi
    .list({ take: 100 })
    .then((r) => r.items.map((p) => ({ id: p.id, title: p.title })))
    .catch(() => []);

  return (
    <>
      <PageHeader
        title="قطعه جدید"
        actions={
          <LinkButton href="/spare-parts" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card>
        <SparePartForm products={products} />
      </Card>
    </>
  );
}
