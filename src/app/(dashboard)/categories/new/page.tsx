import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { categoriesApi } from "@/lib/api";
import { CategoryForm } from "../category-form";

export const metadata: Metadata = { title: "دسته جدید" };

export default async function NewCategoryPage() {
  const { items } = await categoriesApi.list({ take: 100 });

  return (
    <>
      <PageHeader
        title="دسته جدید"
        actions={
          <LinkButton href="/categories" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card>
        <CategoryForm parents={items} />
      </Card>
    </>
  );
}
