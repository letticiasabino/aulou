import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "../supabase/migrations/20260714181441_backend_sprint5_jobs_notifications.sql",
  "utf8",
);

describe("backend sprint 5 migration", () => {
  it("protects jobs with RLS and explicit grants", () => {
    expect(migration).toContain("alter table public.background_jobs enable row level security");
    expect(migration).toContain("(select auth.uid()) = user_id");
    expect(migration).toContain(
      "grant select, insert, update, delete on table public.background_jobs to service_role",
    );
  });

  it("claims jobs atomically and prevents concurrent delivery", () => {
    expect(migration).toContain("for update skip locked");
    expect(migration).toContain("locked_until < now()");
    expect(migration).toContain("revoke all on function public.claim_background_jobs");
  });

  it("enqueues event reminders idempotently", () => {
    expect(migration).toContain("academic-event-reminder:");
    expect(migration).toContain("on conflict (idempotency_key) do update");
  });
});
