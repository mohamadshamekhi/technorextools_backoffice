"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { SelectInput } from "@/components/ui/form-controls";
import { setRepairStatusAction } from "./actions";
import {
  REPAIR_STATUSES,
  REPAIR_STATUS_LABELS,
  type RepairStatus,
} from "@/lib/api/backoffice/moderation";

export function RepairStatusSelect({
  repairId,
  status,
}: {
  repairId: string;
  status: RepairStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <SelectInput
        aria-label="وضعیت تعمیر"
        value={status}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value as RepairStatus;
          startTransition(async () => {
            await setRepairStatusAction(repairId, next);
          });
        }}
        className="w-40"
      >
        {REPAIR_STATUSES.map((s) => (
          <option key={s} value={s}>
            {REPAIR_STATUS_LABELS[s]}
          </option>
        ))}
      </SelectInput>
      {isPending && <Loader2 className="size-4 animate-spin text-muted" />}
    </div>
  );
}
