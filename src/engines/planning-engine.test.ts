import { describe, expect, it } from "vitest";
import { confirmAcademicEvent } from "@/engines/calendar-engine";
import { normalizeExtractedEvent } from "@/engines/import-engine";
import { generateBasicStudyTasks } from "@/engines/planning-engine";
import { generateStudyPlan, replanOverdueTasks } from "@/engines/planning-engine";

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

  it("distribui sessoes dentro da disponibilidade diaria e prioriza prazo", () => {
    const exam = confirmAcademicEvent(
      normalizeExtractedEvent({
        sourceFileId: "file_1",
        title: "Prova",
        subjectName: "Anatomia",
        eventType: "exam",
        startsAt: "2026-09-03T12:00:00.000Z",
        weight: 40,
        confidenceScore: 99,
      }),
      "user_1",
    );
    const assignment = confirmAcademicEvent(
      normalizeExtractedEvent({
        sourceFileId: "file_2",
        title: "Trabalho",
        subjectName: "Bioquímica",
        eventType: "assignment",
        startsAt: "2026-09-06T12:00:00.000Z",
        confidenceScore: 99,
      }),
      "user_1",
    );
    const plan = generateStudyPlan({
      events: [assignment, exam],
      availableMinutesPerDay: 60,
      difficultyBySubject: { Anatomia: 5, Bioquímica: 2 },
      startDate: "2026-09-01",
      horizonDays: 7,
      now: new Date("2026-09-01T08:00:00.000Z"),
    });

    expect(plan.tasks.length).toBeGreaterThan(1);
    expect(plan.days.every((day) => day.plannedMinutes <= day.availableMinutes)).toBe(true);
    expect(plan.tasks[0]?.eventId).toBe(exam.id);
    expect(plan.tasks.every((task) => task.estimatedMinutes <= 60)).toBe(true);
  });

  it("reagenda tarefa atrasada para hoje e preserva o status", () => {
    const plan = generateStudyPlan({
      events: [],
      availableMinutesPerDay: 60,
      startDate: "2026-09-01",
      horizonDays: 3,
      now: new Date("2026-09-01T08:00:00.000Z"),
    });
    const withTask = {
      ...plan,
      tasks: [
        {
          id: "task_1",
          eventId: "event_1",
          title: "Revisar",
          dueAt: "2026-09-02T00:00:00.000Z",
          estimatedMinutes: 30,
          priority: "high" as const,
          status: "todo" as const,
          scheduledFor: "2026-08-31",
        },
      ],
      days: plan.days.map((day) => ({
        ...day,
        tasks:
          day.date === "2026-08-31"
            ? [
                {
                  id: "task_1",
                  eventId: "event_1",
                  title: "Revisar",
                  dueAt: "2026-09-02T00:00:00.000Z",
                  estimatedMinutes: 30,
                  priority: "high" as const,
                  status: "todo" as const,
                  scheduledFor: "2026-08-31",
                },
              ]
            : [],
      })),
    };
    const replanned = replanOverdueTasks(withTask, new Date("2026-09-01T08:00:00.000Z"));
    expect(replanned.tasks[0]?.scheduledFor).toBe("2026-09-01");
    expect(replanned.tasks[0]?.overdue).toBe(true);
  });
});
