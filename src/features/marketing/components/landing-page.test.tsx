import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingPage } from "@/features/marketing/components/landing-page";

describe("LandingPage", () => {
  it("mostra o posicionamento principal", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: "Aulou" })).toBeInTheDocument();
    expect(screen.getByText(/o estudante envia o cronograma/i)).toBeInTheDocument();
    expect(screen.getAllByText("Importar cronograma")[0]).toBeInTheDocument();
  });
});
