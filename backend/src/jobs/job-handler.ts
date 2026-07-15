import type { BackgroundJob, BackgroundJobType } from "./job.types.js";
import { queueForJobType, type JobQueue } from "./job-environment.js";

export interface JobHandler {
  readonly jobType: BackgroundJobType;
  readonly queueName: JobQueue;
  handle(job: BackgroundJob): Promise<Record<string, unknown>>;
}

export class JobHandlerRegistry {
  private readonly handlers = new Map<BackgroundJobType, JobHandler>();

  constructor(handlers: readonly JobHandler[]) {
    for (const handler of handlers) {
      if (this.handlers.has(handler.jobType))
        throw new Error(`Duplicate handler: ${handler.jobType}`);
      this.handlers.set(handler.jobType, handler);
    }
  }

  handle(job: BackgroundJob): Promise<Record<string, unknown>> {
    if (job.queue_name !== queueForJobType(job.type))
      throw new Error(`Job queue does not match type: ${job.type}`);
    const handler = this.handlers.get(job.type);
    if (!handler) throw new Error(`No handler registered for job type: ${job.type}`);
    if (handler.queueName !== job.queue_name)
      throw new Error(`Handler queue does not match job queue: ${job.queue_name}`);
    return handler.handle(job);
  }
}
