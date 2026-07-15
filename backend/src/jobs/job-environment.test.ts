import { describe, expect, it } from "vitest";
import { JobHandlerRegistry } from "./job-handler.js";
import { parseWorkerQueues, requireWorkerEnvironment } from "./job-environment.js";
import type { BackgroundJob } from "./job.types.js";

const job: BackgroundJob = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "22222222-2222-4222-8222-222222222222",
  type: "file_extraction",
  environment: "test",
  queue_name: "file-extraction",
  status: "pending",
  payload: { extractionId: "33333333-3333-4333-8333-333333333333" },
  attempts: 0,
  max_attempts: 5,
};

describe("job environment isolation", () => {
  it("requires a valid worker environment and non-empty known queues", () => {
    expect(() => requireWorkerEnvironment(undefined)).toThrow(/WORKER_ENVIRONMENT/);
    expect(() => requireWorkerEnvironment("invalid")).toThrow(/valid/);
    expect(() => parseWorkerQueues(undefined)).toThrow(/WORKER_QUEUES/);
    expect(() => parseWorkerQueues("unknown")).toThrow(/unknown/);
    expect(parseWorkerQueues("file-extraction,file-extraction")).toEqual(["file-extraction"]);
  });

  it("does not dispatch a job to a handler from another queue", () => {
    const registry = new JobHandlerRegistry([
      {
        jobType: "file_extraction",
        queueName: "file-extraction",
        async handle() {
          return {};
        },
      },
    ]);
    expect(() => registry.handle({ ...job, queue_name: "notification" })).toThrow(/queue/);
  });
});
