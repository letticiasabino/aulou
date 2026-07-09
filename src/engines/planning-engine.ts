import type { AcademicEvent, StudyTask } from "@/types/academic";

export interface PlanningInput {
  events: AcademicEvent[];
  availableMinutesPerDay: number;
  difficultyBySubject?: Record<string, 1 | 2 | 3 | 4 | 5>;
}

export function generateBasicStudyTasks(input: PlanningInput): StudyTask[] {
  return input.events
    .filter((event) => event.eventType === "exam" || event.eventType === "assignment")
    .sort((left, right) => (left.startsAt ?? "").localeCompare(right.startsAt ?? ""))
    .map((event) => {
      const difficulty = input.difficultyBySubject?.[event.subjectName] ?? 3;
      const weightMultiplier = event.weight ? Math.max(1, event.weight / 20) : 1;
      const estimatedMinutes = Math.ceil(
        Math.min(240, input.availableMinutesPerDay * difficulty * weightMultiplier),
      );

      return {
        id: `task_${event.id}`,
        eventId: event.id,
        title: `Estudar para ${event.title}`,
        dueAt: event.startsAt ?? event.confirmedAt,
        estimatedMinutes,
        priority: event.priority,
        status: "todo" as const,
      };
    });
}
