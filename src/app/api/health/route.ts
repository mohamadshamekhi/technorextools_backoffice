import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** پروب liveness برای nginx و اسکریپت deploy. */
export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "abzar-backoffice",
    timestamp: new Date().toISOString(),
  });
}
