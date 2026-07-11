import { describe, expect, it } from "vitest";
import { AnalyticsEngine } from "@/engines/analytics-engine";

const event = (
  name: "signup_started" | "signup_completed" | "onboarding_completed",
  userId: string,
) => ({
  id: crypto.randomUUID(),
  name,
  userId,
  properties: {},
  occurredAt: new Date().toISOString(),
});

describe("AnalyticsEngine", () => {
  it("normaliza nomes e remove propriedades sensíveis", () => {
    const engine = new AnalyticsEngine();
    expect(engine.normalizeEventName(" Upload Started ")).toBe("upload_started");
    expect(
      engine.sanitizeProperties({ plan: "free", password: "secret", content: "material" }),
    ).toEqual({ plan: "free" });
  });
  it("calcula usuários únicos e conversão do funil", () => {
    const engine = new AnalyticsEngine();
    const funnel = engine.buildFunnel([
      event("signup_started", "u1"),
      event("signup_started", "u1"),
      event("signup_completed", "u1"),
      event("signup_started", "u2"),
    ]);
    expect(funnel[0]).toMatchObject({ users: 2, conversionFromPrevious: 0 });
    expect(funnel[1]).toMatchObject({ users: 1, conversionFromPrevious: 50 });
  });
});
