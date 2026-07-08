import { describe, expect, it } from "vitest";
import { confirmAcademicEvent } from "@/engines/calendar-engine";
import { normalizeExtractedEvent } from "@/engines/import-engine";
import { generateBasicStudyTasks } from "@/engines/planning-engine";

describe("PlanningEngine", () => {
  it("gera tarefas para provas e trabalhos", () => {
    const exam = confirmAcademicEvent(
      normalizeExtractedEvent({
        sourceFileId: "file_1",
        title: "Prova de Anatomia",
        subjectName: "Anatomia",
        eventType: "exam",
        startsAt: "2026-09-01T12:00:00.000Z",
        weight: 40,
        confidenceScore: 98,
      }),
      "user_1",
    );

    const tasks = generateBasicStudyTasks({
      events: [exam],
      availableMinutesPerDay: 45,
      difficultyBySubject: { Anatomia: 4 },
    });

    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.priority).toBe("maximum");
    expect(tasks[0]?.estimatedMinutes).toBeGreaterThan(45);
  });
});
