import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentUser } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { getBadgeCountsAction } from "@/lib/badge-actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    // توکن نامعتبر/منقضی که از لبه رد شده — به لاگین برگرد
    if (error instanceof ApiError && (error.isUnauthorized || error.isForbidden)) {
      redirect("/login");
    }
    throw error;
  }

  const badges = await getBadgeCountsAction();

  return (
    <DashboardShell user={user} initialBadges={badges}>
      {children}
    </DashboardShell>
  );
}
