import { beforeEach, describe, expect, it } from "vitest";
import { academicService } from "@/services/academic.service";

describe("academicService", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("salva perfil acadêmico e cria curso/semestre", async () => {
    const context = await academicService.saveProfile("user_1", {
      displayName: "Marina",
      institutionName: "Universidade Federal",
      courseName: "Medicina",
      currentSemester: "4",
      academicYear: "2026",
      timezone: "America/Sao_Paulo",
    });

    expect(context.profile?.displayName).toBe("Marina");
    expect(context.course?.name).toBe("Medicina");
    expect(context.semester?.label).toBe("4º semestre - 2026");
  });

  it("adiciona disciplina com professor e calcula resumo", async () => {
    await academicService.saveProfile("user_1", {
      displayName: "Marina",
      institutionName: "Universidade Federal",
      courseName: "Medicina",
      currentSemester: "4",
      academicYear: "2026",
      timezone: "America/Sao_Paulo",
    });

    const context = await academicService.addSubject("user_1", {
      name: "Anatomia",
      code: "med201",
      teacherName: "Dra. Beatriz",
      teacherEmail: "beatriz@faculdade.edu",
      weeklyHours: "6",
      difficulty: "4",
      color: "#42d392",
    });

    const summary = academicService.summarize(context);

    expect(context.subjects).toHaveLength(1);
    expect(context.teachers).toHaveLength(1);
    expect(context.subjects[0]?.code).toBe("MED201");
    expect(summary.subjectCount).toBe(1);
    expect(summary.teacherCount).toBe(1);
    expect(summary.weeklyHours).toBe(6);
  });

  it("remove disciplina sem apagar professor criado", async () => {
    const context = await academicService.addSubject("user_1", {
      name: "Ética",
      code: "",
      teacherName: "Dra. Helena",
      teacherEmail: "",
      weeklyHours: "",
      difficulty: "2",
      color: "#ffcc66",
    });

    const nextContext = await academicService.removeSubject(
      "user_1",
      context.subjects[0]?.id ?? "",
    );

    expect(nextContext.subjects).toHaveLength(0);
    expect(nextContext.teachers).toHaveLength(1);
  });
});
