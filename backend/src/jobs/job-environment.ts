export const JOB_ENVIRONMENTS = ["development", "test", "staging", "production"] as const;
export const JOB_QUEUES = [
  "file-extraction",
  "notification",
  "ocr",
  "document-analysis",
  "email",
] as const;
export type JobEnvironment = (typeof JOB_ENVIRONMENTS)[number];
export type JobQueue = (typeof JOB_QUEUES)[number];

export function queueForJobType(type: "academic_event_reminder" | "file_extraction"): JobQueue {
  return type === "file_extraction" ? "file-extraction" : "notification";
}

export function parseWorkerQueues(value: string | undefined): JobQueue[] {
  if (!value?.trim()) throw new Error("WORKER_QUEUES is required for a worker.");
  const queues = [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
  if (!queues.length || queues.some((queue) => !JOB_QUEUES.includes(queue as JobQueue)))
    throw new Error("WORKER_QUEUES contains an unknown queue.");
  return queues as JobQueue[];
}

export function requireWorkerEnvironment(value: string | undefined): JobEnvironment {
  if (!value || !JOB_ENVIRONMENTS.includes(value as JobEnvironment))
    throw new Error("WORKER_ENVIRONMENT is required and must be valid.");
  return value as JobEnvironment;
}
