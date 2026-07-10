import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AcademicDomainManager } from "@/features/academic/components/academic-domain-manager";

vi.mock("@/hooks/use-academic-context", () => ({
  useAcademicContext: () => ({
    user: { id: "demo-user", email: "demo@studypilot.ai", mode: "demo" },
    loading: false,
    error: null,
    refresh: vi.fn(),
    context: {
      profile: {
        userId: "demo-user",
        institutionId: "institution_1",
        courseId: "course_1",
        semesterId: "semester_1",
        displayName: "Marina",
        institutionName: "Universidade Federal",
        courseName: "Medicina",
        currentSemester: 4,
        academicYear: 2026,
        timezone: "America/Sao_Paulo",
        onboardingCompletedAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      },
      institution: {
        id: "institution_1",
        userId: "demo-user",
        name: "Universidade Federal",
        campus: "Centro",
        city: "Curitiba",
        country: "Brasil",
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      },
      course: {
        id: "course_1",
        userId: "demo-user",
        institutionId: "institution_1",
        name: "Medicina",
        institutionName: "Universidade Federal",
        degree: "Bacharelado",
        status: "active",
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      },
      semester: {
        id: "semester_1",
        userId: "demo-user",
        courseId: "course_1",
        label: "4º semestre - 2026",
        number: 4,
        academicYear: 2026,
        startsOn: null,
        endsOn: null,
        status: "active",
        createdAt: "2026-07-10T00:00:00.000Z",
        updatedAt: "2026-07-10T00:00:00.000Z",
      },
      teachers: [],
      subjects: [],
    },
    summary: {
      hasCompletedOnboarding: true,
      subjectCount: 0,
      teacherCount: 0,
      averageDifficulty: 0,
      weeklyHours: 0,
    },
  }),
}));

describe("AcademicDomainManager", () => {
  it("renderiza abas e formulário de faculdade", () => {
    render(<AcademicDomainManager />);

    expect(screen.getByRole("heading", { name: "Contexto acadêmico" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Faculdade" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Universidade Federal")).toHaveValue("Universidade Federal");
  });
});
