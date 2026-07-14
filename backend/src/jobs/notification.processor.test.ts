import { describe, expect, it } from "vitest";
import { buildEventNotification } from "./notification.processor.js";

const base = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "22222222-2222-4222-8222-222222222222",
  title: "Cálculo I",
  event_type: "exam",
  start_at: "2026-07-17T12:00:00.000Z",
  status: "scheduled",
};

describe("notification job processor", () => {
  it("builds an upcoming exam notification with a stable id", () => {
    expect(buildEventNotification(base, new Date("2026-07-14T12:00:00.000Z"))).toEqual({
      id: `exam:${base.id}`,
      type: "exam",
      title: "Prova se aproximando",
      message: "Cálculo I acontece em breve.",
      severity: "high",
    });
  });

  it("turns a past event into an overdue notification", () => {
    const notification = buildEventNotification(base, new Date("2026-07-18T12:00:00.000Z"));
    expect(notification.type).toBe("overdue");
    expect(notification.id).toBe(`overdue:${base.id}`);
  });
});
