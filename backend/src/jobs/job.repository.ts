import type { SupabaseClient } from "@supabase/supabase-js";
import type { BackgroundJob } from "./job.types.js";
import type { JobEnvironment, JobQueue } from "./job-environment.js";

export class JobRepository {
  constructor(private readonly client: SupabaseClient) {}

  async claim(
    workerId: string,
    environment: JobEnvironment,
    queues: JobQueue[],
    batchSize: number,
  ): Promise<BackgroundJob[]> {
    const result = await this.client.rpc("claim_background_jobs", {
      worker_id: workerId,
      worker_environment: environment,
      worker_queues: queues,
      batch_size: batchSize,
      lock_seconds: 60,
    });
    if (result.error) throw new Error(`Could not claim jobs: ${result.error.message}`);
    return (result.data ?? []) as BackgroundJob[];
  }

  async complete(jobId: string, result: Record<string, unknown>): Promise<void> {
    const response = await this.client
      .from("background_jobs")
      .update({
        status: "completed",
        result,
        completed_at: new Date().toISOString(),
        locked_at: null,
        locked_until: null,
        locked_by: null,
        last_error: null,
      })
      .eq("id", jobId)
      .eq("status", "running");
    if (response.error) throw new Error(`Could not complete job: ${response.error.message}`);
  }

  async fail(job: BackgroundJob, error: unknown, now = new Date()): Promise<void> {
    const dead = job.attempts >= job.max_attempts;
    const delaySeconds = Math.min(15 * 2 ** Math.max(job.attempts - 1, 0), 3600);
    const message =
      error instanceof Error && error.name === "ExtractionError"
        ? error.message.slice(0, 500)
        : "Falha no processamento do job.";
    const response = await this.client
      .from("background_jobs")
      .update({
        status: dead ? "dead" : "retry",
        scheduled_at: dead
          ? now.toISOString()
          : new Date(now.getTime() + delaySeconds * 1000).toISOString(),
        available_at: dead
          ? now.toISOString()
          : new Date(now.getTime() + delaySeconds * 1000).toISOString(),
        last_error: message,
        locked_at: null,
        locked_until: null,
        locked_by: null,
      })
      .eq("id", job.id)
      .eq("status", "running");
    if (response.error) throw new Error(`Could not fail job: ${response.error.message}`);
  }
}
