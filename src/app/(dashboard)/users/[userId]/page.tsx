import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { usersApi, guardedResource } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { UserEditForm } from "./user-edit-form";

export const metadata: Metadata = { title: "جزئیات کاربر" };

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const user = await guardedResource(usersApi.get(userId));
  const roles = await usersApi.listRoles().catch(() => []);

  return (
    <>
      <PageHeader
        title={user.fullName ?? "کاربر بدون نام"}
        description={user.mobile}
        actions={
          <Link
            href="/users"
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
          >
            <ArrowRight className="size-4" />
            بازگشت به لیست
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="اطلاعات پایه">
          <dl className="space-y-3 text-sm">
            <Row label="شناسه">
              <span dir="ltr">{user.id}</span>
            </Row>
            <Row label="موبایل">
              <span dir="ltr">{user.mobile}</span>
            </Row>
            <Row label="ایمیل">
              <span dir="ltr">{user.email ?? "—"}</span>
            </Row>
            <Row label="نقش">{user.role?.title ?? "—"}</Row>
            <Row label="تاریخ ثبت‌نام">{formatDate(user.createdAt)}</Row>
          </dl>
        </Card>

        <Card title="ویرایش کاربر">
          <UserEditForm user={user} roles={roles} />
        </Card>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-end">{children}</dd>
    </div>
  );
}
