import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DeleteButton } from "@/components/ui/delete-button";
import { contentApi, ApiError } from "@/lib/api";
import { ArticleForm } from "../article-form";
import { deleteArticleAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش مقاله" };

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;

  let article;
  try {
    article = await contentApi.getArticle(articleId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const deleteAction = deleteArticleAction.bind(null, articleId);

  return (
    <>
      <PageHeader
        title={article.title}
        description={article.slug}
        actions={
          <LinkButton href="/articles" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card className="mb-4">
        <ArticleForm article={article} />
      </Card>
      <DeleteButton action={deleteAction} redirectTo="/articles">
        حذف مقاله
      </DeleteButton>
    </>
  );
}
