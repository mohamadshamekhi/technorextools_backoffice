import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { categoriesApi, ApiError } from "@/lib/api";
import { AttributeGroupsManager } from "../../attribute-groups-manager";

export const metadata: Metadata = { title: "گروه‌های ویژگی" };

export default async function CategoryAttributesPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;

  let category;
  try {
    const { items } = await categoriesApi.list({ take: 100 });
    category = items.find((c) => c.id === categoryId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  if (!category) notFound();

  const groups = await categoriesApi
    .listAttributeGroups(categoryId)
    .catch(() => []);

  return (
    <>
      <PageHeader
        title={`گروه‌های ویژگی — ${category.title}`}
        description="ویژگی‌هایی که هنگام ساخت محصولِ این دسته قابل انتخاب‌اند."
        actions={
          <LinkButton href={`/categories/${categoryId}`} variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت به دسته
          </LinkButton>
        }
      />

      <Card>
        <AttributeGroupsManager categoryId={categoryId} groups={groups} />
      </Card>
    </>
  );
}
