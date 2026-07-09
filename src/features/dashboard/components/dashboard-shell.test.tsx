import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

describe("DashboardShell", () => {
  it("renderiza placeholders principais do dashboard", () => {
    render(<DashboardShell />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Calendário acadêmico")).toBeInTheDocument();
    expect(screen.getByText("Próximas tarefas")).toBeInTheDocument();
  });
});
