import { describe, expect, it } from "vitest";
import { semesterBodySchema } from "./semesters/semesters.module.js";
import { subjectBodySchema } from "./subjects/subjects.module.js";
import { academicEventBodySchema } from "./academic-events/academic-events.module.js";

const semesterId = "11111111-1111-4111-8111-111111111111";

describe("academic domain validation", () => {
  it("rejects a semester with an inverted date range", () => {
    expect(() =>
      semesterBodySchema.parse({ name: "2026.1", startDate: "2026-08-01", endDate: "2026-07-01" }),
    ).toThrow();
  });

  it("rejects negative workload and unsafe colors", () => {
    expect(() =>
      subjectBodySchema.parse({ semesterId, name: "Calculo", workloadHours: -1 }),
    ).toThrow();
    expect(() => subjectBodySchema.parse({ semesterId, name: "Calculo", color: "red" })).toThrow();
  });

  it("rejects an event ending before it starts and strips identity fields", () => {
    expect(() =>
      academicEventBodySchema.parse({
        title: "Prova",
        eventType: "exam",
        startAt: "2026-08-10T10:00:00Z",
        endAt: "2026-08-10T09:00:00Z",
      }),
    ).toThrow();
    expect(() =>
      academicEventBodySchema.parse({
        title: "Prova",
        eventType: "exam",
        startAt: "2026-08-10T10:00:00Z",
        user_id: "other",
      }),
    ).toThrow();
  });
});
