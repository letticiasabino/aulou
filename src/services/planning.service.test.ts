import { beforeEach, describe, expect, it } from "vitest";
import { planningService } from "@/services/planning.service";

describe("planningService", () => {
  beforeEach(() => window.localStorage.clear());

  it("salva plano local e permite concluir tarefa", async () => {
    const plan = await planningService.create("user_1", {
      events: [],
      availableMinutesPerDay: 60,
      horizonDays: 7,
      startDate: "2026-09-01",
    });
    const task = {
      id: "task_1",
      eventId: "event_1",
      title: "Revisar",
      dueAt: "2026-09-02T00:00:00.000Z",
      estimatedMinutes: 30,
      priority: "high" as const,
      status: "todo" as const,
      scheduledFor: "2026-09-01",
    };
    const updated = await planningService.updateTask(
      "user_1",
      { ...plan, tasks: [task], days: [{ ...plan.days[0]!, tasks: [task], plannedMinutes: 30 }] },
      task.id,
      "done",
    );
    expect(updated?.tasks[0]?.status).toBe("done");
  });
});
