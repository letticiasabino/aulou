import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/features/auth/schemas/auth-schemas";

describe("auth schemas", () => {
  it("valida login com email e senha", () => {
    expect(loginSchema.safeParse({ email: "ana@faculdade.com", password: "123456" }).success).toBe(
      true,
    );
  });

  it("rejeita cadastro sem nome suficiente", () => {
    expect(
      registerSchema.safeParse({ name: "A", email: "ana@faculdade.com", password: "123456" })
        .success,
    ).toBe(false);
  });
});
