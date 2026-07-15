import { z } from "zod";
import { JOB_ENVIRONMENTS } from "../jobs/job-environment.js";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    APP_ENVIRONMENT: z.enum(JOB_ENVIRONMENTS).default("development"),
    WORKER_ENVIRONMENT: z.enum(JOB_ENVIRONMENTS).optional(),
    WORKER_QUEUES: z.string().trim().min(1).optional(),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_MODEL: z.string().min(1).default("gpt-5-mini"),
    RESEND_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().email().optional(),
    WORKER_POLL_INTERVAL_MS: z.coerce.number().int().min(1_000).max(300_000).default(10_000),
    WORKER_BATCH_SIZE: z.coerce.number().int().min(1).max(100).default(10),
    POSTHOG_KEY: z.string().min(1).optional(),
    POSTHOG_HOST: z.string().url().optional(),
    FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV === "production") {
      if (!value.SUPABASE_URL) {
        context.addIssue({
          code: "custom",
          path: ["SUPABASE_URL"],
          message: "Required in production.",
        });
      }
      if (!value.SUPABASE_PUBLISHABLE_KEY && !value.SUPABASE_ANON_KEY) {
        context.addIssue({
          code: "custom",
          path: ["SUPABASE_PUBLISHABLE_KEY"],
          message: "SUPABASE_PUBLISHABLE_KEY or SUPABASE_ANON_KEY is required in production.",
        });
      }
      if (!value.SUPABASE_SERVICE_ROLE_KEY) {
        context.addIssue({
          code: "custom",
          path: ["SUPABASE_SERVICE_ROLE_KEY"],
          message: "Required in production.",
        });
      }
      if (value.RESEND_API_KEY && !value.EMAIL_FROM) {
        context.addIssue({
          code: "custom",
          path: ["EMAIL_FROM"],
          message: "Required when RESEND_API_KEY is set.",
        });
      }
    }
  });

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(input: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(input);
}

export const env = parseEnv();
