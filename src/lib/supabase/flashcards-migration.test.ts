import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260711010000_flashcards.sql"),
  "utf8",
);

describe("flashcards migration", () => {
  it("cria baralhos, cartões, revisões e RLS por usuário", () => {
    expect(migration).toContain("public.flashcard_decks");
    expect(migration).toContain("public.flashcards");
    expect(migration).toContain("public.flashcard_reviews");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("auth.uid()) = user_id");
  });
});
