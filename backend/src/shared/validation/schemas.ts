import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("aulou-api"),
  version: z.literal("1.0.0"),
  environment: z.enum(["development", "test", "production"]),
});

export const readyResponseSchema = z.object({
  status: z.literal("ready"),
  service: z.literal("aulou-api"),
  version: z.literal("1.0.0"),
  environment: z.enum(["development", "test", "production"]),
  checks: z.object({ configuration: z.literal("ok") }),
});
