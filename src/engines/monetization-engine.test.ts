import { describe, expect, it } from "vitest";
import {
  canUseFeature,
  formatPlanPrice,
  getUpgradeTarget,
  getUsageState,
} from "@/engines/monetization-engine";

describe("MonetizationEngine", () => {
  it("bloqueia uso quando o limite do plano Free é atingido", () => {
    expect(canUseFeature("free", "uploadsPerMonth", 2)).toBe(true);
    expect(canUseFeature("free", "uploadsPerMonth", 3)).toBe(false);
  });

  it("sugere upgrade progressivo", () => {
    expect(getUpgradeTarget("free")).toBe("plus");
    expect(getUpgradeTarget("plus")).toBe("pro");
    expect(getUpgradeTarget("pro")).toBeNull();
  });

  it("calcula estado de uso e preço anual com desconto", () => {
    const state = getUsageState("plus", { uploads: 4, aiCredits: 20, flashcards: 10, quizzes: 1 });
    expect(state.uploads).toEqual({ used: 4, limit: 30 });
    expect(formatPlanPrice("plus", "yearly")).toContain("199,00");
  });
});
