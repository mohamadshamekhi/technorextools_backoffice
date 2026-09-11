import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DeleteButton } from "@/components/ui/delete-button";
import { shippingApi, ApiError } from "@/lib/api";
import { ShippingForm } from "../shipping-form";
import { deleteShippingAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش روش ارسال" };

export default async function ShippingDetailPage({
  params,
}: {
  params: Promise<{ methodId: string }>;
}) {
  const { methodId } = await params;

  let method;
  try {
    const all = await shippingApi.list();
    method = all.find((m) => m.id === methodId);
    if (!method) notFound();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const deleteAction = deleteShippingAction.bind(null, methodId);

  return (
    <>
      <PageHeader
        title={method.title}
        actions={
          <LinkButton href="/shipping" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card className="mb-4">
        <ShippingForm method={method} />
      </Card>
      <DeleteButton action={deleteAction} redirectTo="/shipping">
        حذف روش ارسال
      </DeleteButton>
    </>
  );
}
