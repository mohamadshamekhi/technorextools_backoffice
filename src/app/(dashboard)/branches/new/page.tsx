import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { BranchForm } from "../branch-form";

export const metadata: Metadata = { title: "شعبه جدید" };

export default function NewBranchPage() {
  return (
    <>
      <PageHeader
        title="شعبه جدید"
        actions={
          <LinkButton href="/branches" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card>
        <BranchForm />
      </Card>
    </>
  );
}
