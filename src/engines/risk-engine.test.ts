import { describe, expect, it } from "vitest";
import { calculateAcademicRisk } from "@/engines/risk-engine";
import type { AcademicEvent, StudyTask } from "@/types/academic";

const event = (id: string, type: AcademicEvent["eventType"], startsAt: string): AcademicEvent => ({
  id,
  userId: "user-1",
  sourceFileId: "file-1",
  title: id,
  subjectName: "História",
  eventType: type,
  startsAt,
  endsAt: null,
  isAllDay: true,
  weight: null,
  confidenceScore: 100,
  confidenceLabel: "high_confidence",
  reviewStatus: "confirmed",
  priority: type === "exam" ? "maximum" : "high",
  reviewReasons: [],
  dedupeKey: id,
  confirmedAt: startsAt,
});

describe("RiskEngine", () => {
  it("reduz o score por eventos e tarefas atrasadas", () => {
    const now = new Date("2026-07-11T12:00:00.000Z");
    const task: StudyTask = {
      id: "task-1",
      eventId: "event-1",
      title: "Revisar",
      dueAt: "2026-07-10T12:00:00.000Z",
      estimatedMinutes: 30,
      priority: "high",
      status: "todo",
    };
    const risk = calculateAcademicRisk({
      events: [event("event-1", "assignment", "2026-07-10T10:00:00.000Z")],
      tasks: [task],
      now,
    });
    expect(risk.score).toBeLessThanOrEqual(80);
    expect(risk.overdueEvents).toBe(1);
    expect(risk.overdueTasks).toBe(1);
  });
  it("identifica avaliações próximas e dias concentrados", () => {
    const now = new Date("2026-07-11T12:00:00.000Z");
    const risk = calculateAcademicRisk({
      events: ["a", "b", "c"].map((id) => event(id, "exam", "2026-07-13T10:00:00.000Z")),
      now,
    });
    expect(risk.upcomingAssessments).toBe(3);
    expect(risk.busiestDay?.count).toBe(3);
    expect(risk.recommendations.length).toBeGreaterThan(0);
  });
});
