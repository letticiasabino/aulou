import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubjectsManager } from "@/features/academic/components/subjects-manager";

vi.mock("@/hooks/use-academic-context", () => ({
  useAcademicContext: () => ({
    user: { id: "demo-user", email: "demo@aulou.app", mode: "demo" },
    loading: false,
    refresh: vi.fn(),
    context: {
      profile: null,
      course: null,
      semester: null,
      teachers: [],
      subjects: [],
    },
    summary: {
      hasCompletedOnboarding: false,
      subjectCount: 0,
      teacherCount: 0,
      averageDifficulty: 0,
      weeklyHours: 0,
    },
  }),
}));

describe("SubjectsManager", () => {
  it("renderiza formulário e estado vazio", () => {
    render(<SubjectsManager />);

    expect(screen.getByRole("heading", { name: "Cadastrar disciplina" })).toBeInTheDocument();
    expect(screen.getByLabelText("Disciplina")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma disciplina cadastrada")).toBeInTheDocument();
  });
});
