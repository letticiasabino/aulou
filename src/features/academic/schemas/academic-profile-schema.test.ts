import { describe, expect, it } from "vitest";
import {
  academicProfileSchema,
  subjectSchema,
} from "@/features/academic/schemas/academic-profile-schema";

describe("academicProfileSchema", () => {
  it("valida semestre e ano letivo", () => {
    const result = academicProfileSchema.safeParse({
      displayName: "Marina",
      institutionName: "Universidade Federal",
      courseName: "Medicina",
      currentSemester: "3",
      academicYear: "2026",
      timezone: "America/Sao_Paulo",
    });

    expect(result.success).toBe(true);
    expect(result.success ? result.data.currentSemester : null).toBe(3);
  });

  it("rejeita semestre fora da faixa", () => {
    const result = academicProfileSchema.safeParse({
      displayName: "Marina",
      institutionName: "Universidade Federal",
      courseName: "Medicina",
      currentSemester: "13",
      academicYear: "2026",
      timezone: "America/Sao_Paulo",
    });

    expect(result.success).toBe(false);
  });
});

describe("subjectSchema", () => {
  it("normaliza código e e-mail vazio do professor", () => {
    const subject = subjectSchema.parse({
      name: "Cálculo Diferencial",
      code: " mat101 ",
      teacherName: "Ana Ribeiro",
      teacherEmail: "",
      weeklyHours: "4",
      difficulty: "5",
      color: "#9b7cff",
    });

    expect(subject.code).toBe("MAT101");
    expect(subject.teacherEmail).toBeUndefined();
    expect(subject.weeklyHours).toBe(4);
    expect(subject.difficulty).toBe(5);
  });
});
