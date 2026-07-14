import type { AppEnv } from "../../config/env.js";

export type AnalyticsIntegration = { configured: boolean; host?: string };

export function createAnalyticsIntegration(config: AppEnv): AnalyticsIntegration {
  return { configured: Boolean(config.POSTHOG_KEY), host: config.POSTHOG_HOST };
}
