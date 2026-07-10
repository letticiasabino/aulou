import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260710010000_academic_files_limits.sql"),
  "utf8",
);

describe("academic files limits migration", () => {
  it("reaplica limite de tamanho e MIME no banco e no bucket", () => {
    expect(migration).toContain("files_size_bytes_max");
    expect(migration).toContain("10485760");
    expect(migration).toContain("allowed_mime_types");
    expect(migration).toContain("application/pdf");
  });
});
