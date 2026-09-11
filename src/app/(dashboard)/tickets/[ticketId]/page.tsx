import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ticketsApi, ApiError } from "@/lib/api";
import { TicketThread } from "../ticket-thread";

export const metadata: Metadata = { title: "جزئیات تیکت" };

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;

  let ticket;
  try {
    ticket = await ticketsApi.get(ticketId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <PageHeader
        title={ticket.subject}
        description={ticket.customer.fullName ?? ticket.customer.mobile}
        actions={
          <LinkButton href="/tickets" variant="ghost">
            <ArrowRight className="size-4" />
            بازگشت
          </LinkButton>
        }
      />
      <Card>
        <TicketThread ticket={ticket} />
      </Card>
    </>
  );
}
