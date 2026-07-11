import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("notifications migration", () => {
  it("habilita RLS e políticas por usuário", () => {
    const sql = readFileSync("supabase/migrations/20260711020000_notifications.sql", "utf8");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("auth.uid() = user_id");
  });
});
