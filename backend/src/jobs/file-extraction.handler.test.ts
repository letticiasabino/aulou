import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import {
  ExtractionError,
  type ExtractionResult,
} from "../modules/file-extractions/extraction.types.js";
import { FileExtractionJobHandler } from "./file-extraction.handler.js";
import { JobHandlerRegistry } from "./job-handler.js";
import { JobRepository } from "./job.repository.js";
import type { BackgroundJob } from "./job.types.js";

const job: BackgroundJob = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "22222222-2222-4222-8222-222222222222",
  type: "file_extraction",
  environment: "test",
  queue_name: "file-extraction",
  status: "running",
  payload: {
    extractionId: "33333333-3333-4333-8333-333333333333",
    fileId: "44444444-4444-4444-8444-444444444444",
  },
  attempts: 1,
  max_attempts: 5,
};

type FakeState = {
  extractionUpdates: Array<Record<string, unknown>>;
  fileUpdates: Array<Record<string, unknown>>;
};

class FakeQuery implements PromiseLike<{ error: null }> {
  private updateValue?: Record<string, unknown>;

  constructor(
    private readonly table: string,
    private readonly state: FakeState,
  ) {}

  update(value: Record<string, unknown>) {
    this.updateValue = value;
    if (this.table === "file_extractions") this.state.extractionUpdates.push(value);
    if (this.table === "files") this.state.fileUpdates.push(value);
    return this;
  }
  select() {
    return this;
  }
  eq() {
    return this;
  }
  neq() {
    return this;
  }
  maybeSingle() {
    if (this.table === "file_extractions") {
      return Promise.resolve({
        data: { id: job.payload.extractionId, file_id: job.payload.fileId, user_id: job.user_id },
        error: null,
      });
    }
    return Promise.resolve({
      data: {
        id: job.payload.fileId,
        user_id: job.user_id,
        storage_bucket: "academic-files",
        storage_path: `${job.user_id}/arquivo.csv`,
        original_name: "arquivo.csv",
        content_type: "text/csv",
        size_bytes: 7,
        status: "uploaded",
      },
      error: null,
    });
  }
  then<TResult1 = { error: null }, TResult2 = never>(
    onfulfilled?: ((value: { error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    _onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve({ error: null }).then(onfulfilled ?? undefined);
  }
}

function fakeClient(state: FakeState): SupabaseClient {
  return {
    from(table: string) {
      return new FakeQuery(table, state);
    },
    storage: {
      from() {
        return {
          async download() {
            return { data: new Blob(["a,b\n1,2"]), error: null };
          },
        };
      },
    },
  } as unknown as SupabaseClient;
}

const completed: ExtractionResult = {
  status: "completed",
  rawText: "a\tb\n1\t2",
  adapter: "csv",
  structuredPayload: { kind: "csv" },
  metrics: { rows: 2 },
  warnings: [],
  normalizedCharCount: 7,
  tokenCount: 2,
  pageCount: null,
  sheetCount: null,
  rowCount: 2,
};

describe("file extraction jobs", () => {
  it("processes a file through its isolated handler and updates status", async () => {
    const state: FakeState = { extractionUpdates: [], fileUpdates: [] };
    const handler = new FileExtractionJobHandler(fakeClient(state), {
      extract: async () => completed,
    });
    const result = await handler.handle(job);
    expect(state.extractionUpdates.map((value) => value.status)).toEqual([
      "processing",
      "completed",
    ]);
    expect(state.fileUpdates.at(-1)?.status).toBe("processed");
    expect(result).toMatchObject({ status: "completed", adapter: "csv" });
  });

  it("persists a safe failed status when the adapter fails", async () => {
    const state: FakeState = { extractionUpdates: [], fileUpdates: [] };
    const handler = new FileExtractionJobHandler(fakeClient(state), {
      extract: async () => {
        throw new ExtractionError("corrupted", "Arquivo corrompido.");
      },
    });
    await expect(handler.handle(job)).rejects.toThrow("Arquivo corrompido");
    expect(state.extractionUpdates.at(-1)).toMatchObject({
      status: "failed",
      safe_error: "Arquivo corrompido.",
    });
  });

  it("routes extraction jobs without invoking notification logic", async () => {
    const handled: string[] = [];
    const registry = new JobHandlerRegistry([
      {
        jobType: "academic_event_reminder",
        queueName: "notification",
        async handle() {
          handled.push("notification");
          return {};
        },
      },
      {
        jobType: "file_extraction",
        queueName: "file-extraction",
        async handle() {
          handled.push("extraction");
          return {};
        },
      },
    ]);
    await registry.handle(job);
    expect(handled).toEqual(["extraction"]);
  });

  it("moves a failed job to retry and then to dead after the attempt limit", async () => {
    const updates: Array<Record<string, unknown>> = [];
    const client = {
      from() {
        return {
          update(value: Record<string, unknown>) {
            updates.push(value);
            return this;
          },
          eq() {
            return this;
          },
          then(resolve: (value: { error: null }) => unknown) {
            return Promise.resolve(resolve({ error: null }));
          },
        };
      },
    } as unknown as SupabaseClient;
    const repository = new JobRepository(client);
    await repository.fail(job, new Error("adapter failed"), new Date("2026-07-14T12:00:00Z"));
    await repository.fail(
      { ...job, attempts: 5 },
      new Error("adapter failed"),
      new Date("2026-07-14T12:00:00Z"),
    );
    expect(updates[0]).toMatchObject({
      status: "retry",
      last_error: "Falha no processamento do job.",
    });
    expect(updates[1]).toMatchObject({
      status: "dead",
      last_error: "Falha no processamento do job.",
    });
  });
});
