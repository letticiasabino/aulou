import { PLAN_DEFINITIONS } from "@/config/plans";
import type { PlanCode, PlanLimit, UsageCounters } from "@/types/academic";

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

export function getLimitForFeature(plan: PlanCode, limitName: UsageLimitName) {
  return PLAN_DEFINITIONS[plan].limits[limitName];
}

export function getUsageState(plan: PlanCode, usage: UsageCounters) {
  return {
    uploads: { used: usage.uploads, limit: PLAN_DEFINITIONS[plan].limits.uploadsPerMonth },
    aiCredits: { used: usage.aiCredits, limit: PLAN_DEFINITIONS[plan].limits.aiCreditsPerMonth },
    flashcards: { used: usage.flashcards, limit: PLAN_DEFINITIONS[plan].limits.flashcardsPerMonth },
    quizzes: { used: usage.quizzes, limit: PLAN_DEFINITIONS[plan].limits.quizzesPerMonth },
  };
}

export function formatPlanPrice(plan: PlanCode, cycle: "monthly" | "yearly" = "monthly") {
  const cents = PLAN_DEFINITIONS[plan].priceMonthlyCents * (cycle === "yearly" ? 10 : 1);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
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
