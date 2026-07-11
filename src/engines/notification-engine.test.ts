import { describe, expect, it } from "vitest";
import { buildNotifications } from "@/engines/notification-engine";
import type { AcademicEvent } from "@/types/academic";

const event = (id: string, type: AcademicEvent["eventType"], startsAt: string): AcademicEvent => ({
  id,
  userId: "user-1",
  sourceFileId: "file-1",
  title: "Prova de cálculo",
  subjectName: "Cálculo",
  eventType: type,
  startsAt,
  endsAt: null,
  isAllDay: false,
  weight: null,
  confidenceScore: 100,
  confidenceLabel: "high_confidence",
  reviewStatus: "confirmed",
  priority: "maximum",
  reviewReasons: [],
  dedupeKey: id,
  confirmedAt: startsAt,
});

describe("NotificationEngine", () => {
  it("gera alerta para evento vencido e prazo próximo", () => {
    const now = new Date("2026-07-11T12:00:00.000Z");
    const notifications = buildNotifications({
      userId: "user-1",
      events: [
        event("past", "assignment", "2026-07-10T12:00:00.000Z"),
        event("soon", "exam", "2026-07-12T12:00:00.000Z"),
      ],
      now,
    });
    expect(notifications.some((item) => item.type === "overdue")).toBe(true);
    expect(notifications.some((item) => item.type === "exam")).toBe(true);
  });
});
