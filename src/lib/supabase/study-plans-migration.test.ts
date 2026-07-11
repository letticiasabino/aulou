import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260711000000_study_plans.sql"),
  "utf8",
);

describe("study plans migration", () => {
  it("cria planos, tarefas, constraints e RLS", () => {
    expect(migration).toContain("create table if not exists public.study_plans");
    expect(migration).toContain("create table if not exists public.study_tasks");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("auth.uid()) = user_id");
  });
});
