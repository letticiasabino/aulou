import { describe, expect, it } from "vitest";
import { isPrivateRoute } from "@/config/routes";

describe("routes", () => {
  it("protege a rota de professores", () => {
    expect(isPrivateRoute("/teachers")).toBe(true);
    expect(isPrivateRoute("/teachers/active")).toBe(true);
  });
});
