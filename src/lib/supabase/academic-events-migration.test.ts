import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260710020000_academic_events.sql"),
  "utf8",
);

describe("academic events migration", () => {
  it("cria tabela com RLS e bloqueia insert não confirmado", () => {
    expect(migration).toContain("create table if not exists public.academic_events");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("review_status = 'confirmed'");
    expect(migration).toContain("(select auth.uid()) = user_id");
  });
});
