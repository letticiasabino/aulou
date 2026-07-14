import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const initial = readFileSync("../supabase/migrations/20260710000000_initial_backend.sql", "utf8");
const incremental = readFileSync(
  "../supabase/migrations/20260714185103_backend_sprint5_file_extractions.sql",
  "utf8",
);

describe("file extraction persistence migration", () => {
  it("keeps file_extractions behind ownership RLS", () => {
    expect(initial).toContain("alter table public.%I enable row level security");
    expect(initial).toContain("(select auth.uid()) = user_id");
    expect(initial).toContain("'file_extractions'");
  });

  it("adds metrics, OCR status and an idempotency key incrementally", () => {
    expect(incremental).toContain("add column if not exists metrics jsonb");
    expect(incremental).toContain("'ocr_required'");
    expect(incremental).toContain("file_extractions_user_request_key_uidx");
  });

  it("validates ownership inside privileged enqueue and retry functions", () => {
    expect(incremental).toContain("caller_id uuid := auth.uid()");
    expect(incremental).toContain("user_id = caller_id");
    expect(incremental).toContain("revoke all on function public.request_file_extraction");
    expect(incremental).toContain("grant execute on function public.retry_file_extraction");
  });

  it("extends the existing queue without editing its original migration", () => {
    expect(incremental).toContain("'academic_event_reminder', 'file_extraction'");
    expect(incremental).toContain("'file-extraction:' || extraction.id::text");
  });
});
