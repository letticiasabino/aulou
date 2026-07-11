import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("feedback migration", () => {
  it("cria tabela privada com inserção apenas do próprio usuário", () => {
    const sql = readFileSync("supabase/migrations/20260711030000_feedback.sql", "utf8");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("auth.uid()) = user_id");
    expect(sql).toContain("grant insert on public.feedback to authenticated");
  });
});
