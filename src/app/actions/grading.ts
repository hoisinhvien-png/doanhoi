"use server";

import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";

export type RulesState = { error?: string; ok?: boolean } | undefined;

/** Đoàn trường sửa ngưỡng điểm từng mức xếp loại */
export async function updateGradingRules(_prev: RulesState, formData: FormData): Promise<RulesState> {
  await requireRole("ADMIN");
  const rules = await prisma.gradingRule.findMany();
  const updates: { id: string; minScore: number }[] = [];
  for (const r of rules) {
    const raw = String(formData.get(`rule_${r.id}`) ?? "").replace(",", ".");
    const v = Number(raw);
    if (raw === "" || isNaN(v) || v < 0 || v > 10) {
      return { error: `Ngưỡng của mức “${r.label}” phải là số từ 0 đến 10.` };
    }
    updates.push({ id: r.id, minScore: v });
  }
  await prisma.$transaction(
    updates.map((u) => prisma.gradingRule.update({ where: { id: u.id }, data: { minScore: u.minScore } }))
  );
  refresh();
  return { ok: true };
}
