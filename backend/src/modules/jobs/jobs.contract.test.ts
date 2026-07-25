import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  "../supabase/migrations/20260724000000_upload_intent_expiry_and_extraction_cancellation_scope.sql",
  "utf8",
);

describe("job cancellation and dead-letter contract", () => {
  it("keeps dead as the terminal dead-letter state and cancels only pending/retry extraction jobs", () => {
    expect(migration).toContain("type = 'file_extraction'");
    expect(migration).toContain("job.status not in ('pending','retry')");
    expect(migration).toContain("status = 'cancelled'");
    expect(migration).not.toContain("dead_letter");
  });
});
