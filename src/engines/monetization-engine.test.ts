import { describe, expect, it } from "vitest";
import { canUseFeature, getUpgradeTarget } from "@/engines/monetization-engine";

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
});
