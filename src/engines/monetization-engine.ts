import { PLAN_DEFINITIONS } from "@/config/plans";
import type { PlanCode, PlanLimit } from "@/types/academic";

export type UsageLimitName = keyof PlanLimit;

export function getPlan(plan: PlanCode) {
  return PLAN_DEFINITIONS[plan];
}

export function canUseFeature(plan: PlanCode, limitName: UsageLimitName, currentUsage: number) {
  const limit = PLAN_DEFINITIONS[plan].limits[limitName];

  if (typeof limit === "boolean") {
    return limit;
  }

  return currentUsage < limit;
}

export function getUpgradeTarget(plan: PlanCode): PlanCode | null {
  if (plan === "free") {
    return "plus";
  }

  if (plan === "plus") {
    return "pro";
  }

  return null;
}
