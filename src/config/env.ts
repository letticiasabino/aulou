import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  POSTHOG_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
