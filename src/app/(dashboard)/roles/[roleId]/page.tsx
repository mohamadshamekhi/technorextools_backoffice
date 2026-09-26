import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DeleteButton } from "@/components/ui/delete-button";
import { accessApi, ApiError } from "@/lib/api";
import { RoleForm } from "../role-form";
import { deleteRoleAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش نقش" };

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;

  let role;
  try {
    role = await accessApi.getRole(roleId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const groups = await accessApi.listPermissions();
  const deleteAction = deleteRoleAction.bind(null, roleId);

  return (
    <>
      <PageHeader
        title={role.title}
        description={role.slug}
        actions={
          <LinkButton href="/roles" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card className="mb-4">
        <RoleForm role={role} groups={groups} />
      </Card>
      {!role.isSystem && (
        <DeleteButton
          action={deleteAction}
          redirectTo="/roles"
          confirmLabel="حذف نقش قطعی است. مطمئن هستید؟"
        >
          حذف نقش
        </DeleteButton>
      )}
    </>
  );
}
