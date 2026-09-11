import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DeleteButton } from "@/components/ui/delete-button";
import { contentApi, ApiError } from "@/lib/api";
import { BranchForm } from "../branch-form";
import { deleteBranchAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش شعبه" };

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;

  let branch;
  try {
    const all = await contentApi.listBranches();
    branch = all.find((b) => b.id === branchId);
    if (!branch) notFound();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const deleteAction = deleteBranchAction.bind(null, branchId);

  return (
    <>
      <PageHeader
        title={branch.title}
        actions={
          <LinkButton href="/branches" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card className="mb-4">
        <BranchForm branch={branch} />
      </Card>
      <DeleteButton action={deleteAction} redirectTo="/branches">
        حذف شعبه
      </DeleteButton>
    </>
  );
}
