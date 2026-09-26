import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DeleteButton } from "@/components/ui/delete-button";
import { categoriesApi, ApiError } from "@/lib/api";
import { CategoryForm } from "../category-form";
import { deleteCategoryAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش دسته" };

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;

  let parents;
  try {
    const { items } = await categoriesApi.list({ take: 100 });
    parents = items;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const category = parents.find((c) => c.id === categoryId);
  if (!category) notFound();

  const groups = await categoriesApi
    .listAttributeGroups(categoryId)
    .catch(() => []);
  const attributeCount = groups.reduce((sum, g) => sum + g.attributes.length, 0);
  const deleteAction = deleteCategoryAction.bind(null, categoryId);

  return (
    <>
      <PageHeader
        title={category.title}
        description={category.slug}
        actions={
          <LinkButton href="/categories" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />

      <div className="space-y-4">
        <Card title="اطلاعات دسته">
          <CategoryForm category={category} parents={parents} />
        </Card>

        <Card title="گروه‌های ویژگی">
          <Link
            href={`/categories/${categoryId}/attributes`}
            className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm hover:bg-border/40"
          >
            <span>
              {groups.length > 0
                ? `${groups.length} گروه، ${attributeCount} ویژگی تعریف‌شده`
                : "هنوز گروه ویژگی‌ای برای این دسته تعریف نشده."}
            </span>
            <span className="flex items-center gap-1 font-medium text-primary">
              مدیریت ویژگی‌ها
              <ChevronLeft className="size-4" />
            </span>
          </Link>
        </Card>

        <DeleteButton action={deleteAction} redirectTo="/categories">
          حذف دسته
        </DeleteButton>
      </div>
    </>
  );
}
