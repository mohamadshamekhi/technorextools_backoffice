import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ArticleForm } from "../article-form";

export const metadata: Metadata = { title: "مقاله جدید" };

export default function NewArticlePage() {
  return (
    <>
      <PageHeader
        title="مقاله جدید"
        actions={
          <LinkButton href="/articles" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card>
        <ArticleForm />
      </Card>
    </>
  );
}
