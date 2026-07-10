import { describe, expect, it } from "vitest";
import {
  academicProfileSchema,
  institutionSchema,
  semesterSchema,
  subjectSchema,
  teacherSchema,
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

  it("normaliza seleção vazia de professor", () => {
    const subject = subjectSchema.parse({
      name: "Bioquímica",
      code: "",
      teacherId: "none",
      teacherName: "",
      teacherEmail: "",
      weeklyHours: "",
      difficulty: "3",
      color: "#9b7cff",
      scheduleNotes: "",
    });

    expect(subject.teacherId).toBeUndefined();
    expect(subject.teacherName).toBeUndefined();
    expect(subject.weeklyHours).toBeUndefined();
  });
});

describe("institutionSchema", () => {
  it("valida faculdade com país padrão", () => {
    const institution = institutionSchema.parse({
      name: "Universidade Federal",
      campus: "",
      city: "Curitiba",
      country: "Brasil",
    });

    expect(institution.name).toBe("Universidade Federal");
    expect(institution.campus).toBeUndefined();
    expect(institution.country).toBe("Brasil");
  });
});

describe("semesterSchema", () => {
  it("rejeita período com data final anterior à inicial", () => {
    const result = semesterSchema.safeParse({
      number: "4",
      academicYear: "2026",
      startsOn: "2026-08-01",
      endsOn: "2026-07-01",
    });

    expect(result.success).toBe(false);
  });
});

describe("teacherSchema", () => {
  it("valida e-mail opcional de professor", () => {
    const teacher = teacherSchema.parse({
      name: "Dra. Beatriz",
      email: "",
      department: "Saúde",
      notes: "",
    });

    expect(teacher.email).toBeUndefined();
    expect(teacher.department).toBe("Saúde");
  });
});
