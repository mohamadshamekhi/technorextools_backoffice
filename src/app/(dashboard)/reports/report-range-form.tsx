"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TextInput, SubmitButton } from "@/components/ui/form-controls";

export function ReportRangeForm({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [f, setF] = useState(from);
  const [t, setT] = useState(to);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      router.push(`/reports?from=${f}&to=${t}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <label className="text-sm">
        <span className="mb-1 block text-muted">از تاریخ</span>
        <TextInput
          type="date"
          dir="ltr"
          value={f}
          onChange={(e) => setF(e.target.value)}
          className="w-44"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-muted">تا تاریخ</span>
        <TextInput
          type="date"
          dir="ltr"
          value={t}
          onChange={(e) => setT(e.target.value)}
          className="w-44"
        />
      </label>
      <SubmitButton pending={isPending}>اعمال</SubmitButton>
    </form>
  );
}
