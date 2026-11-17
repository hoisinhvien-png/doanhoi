"use client";

import { useActionState } from "react";
import { updateGradingRules } from "@/app/actions/grading";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-field";

export function RulesForm({ rules }: { rules: { id: string; label: string; minScore: number }[] }) {
  const [state, action, pending] = useActionState(updateGradingRules, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {rules.map((r) => (
          <label key={r.id} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
            <span className="font-medium">{r.label} ≥</span>
            <input
              name={`rule_${r.id}`}
              defaultValue={r.minScore}
              inputMode="decimal"
              className="h-8 w-16 rounded-md border border-input bg-transparent px-2 text-right"
            />
          </label>
        ))}
        <Button type="submit" variant="outline" disabled={pending} className="h-auto">
          {pending ? "Đang lưu…" : "Lưu ngưỡng"}
        </Button>
      </div>
      <FormError message={state?.error} />
      {state?.ok && <p className="text-sm text-emerald-700">Đã lưu ngưỡng mới.</p>}
    </form>
  );
}
