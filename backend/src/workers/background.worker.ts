import pino from "pino";
import type { AppEnv } from "../config/env.js";
import { createEmailIntegration } from "../integrations/email/email.client.js";
import { createAdminClient } from "../integrations/supabase/admin-client.js";
import { FileExtractionJobHandler } from "../jobs/file-extraction.handler.js";
import { JobHandlerRegistry } from "../jobs/job-handler.js";
import { JobRepository } from "../jobs/job.repository.js";
import { NotificationJobHandler } from "../jobs/notification.processor.js";
import { createLogger } from "../shared/logger/logger.js";

export async function runBackgroundWorker(config: AppEnv, signal?: AbortSignal): Promise<void> {
  const logger = pino(createLogger(config));
  const client = createAdminClient(config);
  const jobs = new JobRepository(client);
  const registry = new JobHandlerRegistry([
    new NotificationJobHandler(client, createEmailIntegration(config)),
    new FileExtractionJobHandler(client),
  ]);
  const workerId = `background-${process.pid}-${crypto.randomUUID()}`;
  logger.info({ workerId }, "background_worker_started");

  while (!signal?.aborted) {
    let claimed = 0;
    try {
      const batch = await jobs.claim(workerId, config.WORKER_BATCH_SIZE);
      claimed = batch.length;
      for (const job of batch) {
        try {
          const result = await registry.handle(job);
          await jobs.complete(job.id, result);
          logger.info({ jobId: job.id, type: job.type }, "job_completed");
        } catch (error) {
          await jobs.fail(job, error);
          logger.error({ err: error, jobId: job.id, type: job.type }, "job_failed");
        }
      }
    } catch (error) {
      logger.error({ err: error }, "worker_poll_failed");
    }
    if (claimed === 0 && !signal?.aborted) {
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, config.WORKER_POLL_INTERVAL_MS);
        signal?.addEventListener(
          "abort",
          () => {
            clearTimeout(timeout);
            resolve();
          },
          { once: true },
        );
      });
    }
  }
  logger.info({ workerId }, "background_worker_stopped");
}
