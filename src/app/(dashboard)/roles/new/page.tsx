import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { accessApi } from "@/lib/api";
import { RoleForm } from "../role-form";

export const metadata: Metadata = { title: "نقش جدید" };

export default async function NewRolePage() {
  const groups = await accessApi.listPermissions();

  return (
    <>
      <PageHeader
        title="نقش جدید"
        actions={
          <LinkButton href="/roles" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card>
        <RoleForm groups={groups} />
      </Card>
    </>
  );
}
