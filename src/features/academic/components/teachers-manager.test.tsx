import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TeachersManager } from "@/features/academic/components/teachers-manager";

vi.mock("@/hooks/use-academic-context", () => ({
  useAcademicContext: () => ({
    user: { id: "demo-user", email: "demo@aulou.app", mode: "demo" },
    loading: false,
    error: null,
    refresh: vi.fn(),
    context: {
      profile: null,
      institution: null,
      course: null,
      semester: null,
      teachers: [],
      subjects: [],
    },
  }),
}));

describe("TeachersManager", () => {
  it("renderiza formulário e estado vazio", () => {
    render(<TeachersManager />);

    expect(screen.getByRole("heading", { name: "Cadastrar professor" })).toBeInTheDocument();
    expect(screen.getByLabelText("Professor")).toBeInTheDocument();
    expect(screen.getByText("Nenhum professor cadastrado")).toBeInTheDocument();
  });
});
