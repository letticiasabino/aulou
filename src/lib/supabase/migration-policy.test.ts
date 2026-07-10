import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260710000000_initial_backend.sql"),
  "utf8",
);

describe("initial Supabase migration", () => {
  it("habilita RLS e cria policies por usuário", () => {
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("to authenticated");
    expect(migration).toContain("(select auth.uid()) = user_id");
    expect(migration).toContain("with check ((select auth.uid()) = user_id)");
  });

  it("cria bucket privado de arquivos acadêmicos", () => {
    expect(migration).toContain("'academic-files'");
    expect(migration).toContain("false");
    expect(migration).toContain("on storage.objects");
    expect(migration).toContain("(storage.foldername(name))[1]");
  });
});
