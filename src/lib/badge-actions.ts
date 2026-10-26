"use server";

import { badgesApi } from "@/lib/api";
import type { BadgeCounts } from "@/lib/api/backoffice/badges";

/** شمارنده‌های سایدبار؛ خطا نباید منو را بشکند، پس در صورت شکست خالی برمی‌گردد. */
export async function getBadgeCountsAction(): Promise<BadgeCounts> {
  try {
    return await badgesApi.counts();
  } catch {
    return {};
  }
}
