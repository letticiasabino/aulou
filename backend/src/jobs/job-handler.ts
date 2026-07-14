import type { BackgroundJob, BackgroundJobType } from "./job.types.js";

export interface JobHandler {
  readonly jobType: BackgroundJobType;
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
    const handler = this.handlers.get(job.type);
    if (!handler) throw new Error(`No handler registered for job type: ${job.type}`);
    return handler.handle(job);
  }
}
