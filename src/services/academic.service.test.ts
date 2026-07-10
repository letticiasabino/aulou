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
    expect(context.institution?.name).toBe("Universidade Federal");
    expect(context.profile?.institutionId).toBe(context.institution?.id);
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

  it("atualiza faculdade, curso e semestre preservando IDs", async () => {
    const context = await academicService.saveProfile("user_1", {
      displayName: "Marina",
      institutionName: "Universidade Federal",
      courseName: "Medicina",
      currentSemester: "4",
      academicYear: "2026",
      timezone: "America/Sao_Paulo",
    });

    const updatedInstitution = await academicService.saveInstitution("user_1", {
      name: "PUC Paraná",
      campus: "Curitiba",
      city: "Curitiba",
      country: "Brasil",
    });
    const updatedCourse = await academicService.saveCourse("user_1", {
      name: "Psicologia",
      degree: "Bacharelado",
    });
    const updatedSemester = await academicService.saveSemester("user_1", {
      number: "5",
      academicYear: "2026",
      startsOn: "2026-08-01",
      endsOn: "2026-12-15",
    });

    expect(updatedInstitution.institution?.id).toBe(context.institution?.id);
    expect(updatedInstitution.profile?.institutionName).toBe("PUC Paraná");
    expect(updatedCourse.course?.name).toBe("Psicologia");
    expect(updatedCourse.profile?.courseName).toBe("Psicologia");
    expect(updatedSemester.semester?.number).toBe(5);
    expect(updatedSemester.profile?.currentSemester).toBe(5);
  });

  it("gerencia professores e desvincula disciplinas ao remover", async () => {
    const withTeacher = await academicService.addTeacher("user_1", {
      name: "Dra. Helena",
      email: "helena@faculdade.edu",
      department: "Humanas",
      notes: "Atendimento às sextas.",
    });
    const teacherId = withTeacher.teachers[0]?.id ?? "";

    const withSubject = await academicService.addSubject("user_1", {
      name: "Ética",
      code: "",
      teacherId,
      teacherName: "",
      teacherEmail: "",
      weeklyHours: "",
      difficulty: "2",
      color: "#ffcc66",
      scheduleNotes: "",
    });

    const withoutTeacher = await academicService.removeTeacher("user_1", teacherId);

    expect(withSubject.subjects[0]?.teacherId).toBe(teacherId);
    expect(withoutTeacher.teachers).toHaveLength(0);
    expect(withoutTeacher.subjects[0]?.teacherId).toBeNull();
  });

  it("edita, arquiva e reativa disciplina", async () => {
    const context = await academicService.addSubject("user_1", {
      name: "Anatomia",
      code: "med201",
      teacherName: "",
      teacherEmail: "",
      weeklyHours: "6",
      difficulty: "4",
      color: "#42d392",
      scheduleNotes: "",
    });
    const subjectId = context.subjects[0]?.id ?? "";

    const updated = await academicService.updateSubject("user_1", subjectId, {
      name: "Anatomia Aplicada",
      code: "med202",
      teacherName: "",
      teacherEmail: "",
      weeklyHours: "8",
      difficulty: "5",
      color: "#5cc8ff",
      scheduleNotes: "Laboratório quinzenal.",
    });
    const archived = await academicService.archiveSubject("user_1", subjectId);
    const restored = await academicService.restoreSubject("user_1", subjectId);

    expect(updated.subjects[0]?.name).toBe("Anatomia Aplicada");
    expect(updated.subjects[0]?.code).toBe("MED202");
    expect(archived.subjects[0]?.status).toBe("archived");
    expect(academicService.summarize(archived).subjectCount).toBe(0);
    expect(restored.subjects[0]?.status).toBe("active");
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
