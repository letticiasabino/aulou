import type { AppEnv } from "../../config/env.js";

export type OpenAIIntegration = { configured: boolean; model: string };

export function createOpenAIIntegration(config: AppEnv): OpenAIIntegration {
  return { configured: Boolean(config.OPENAI_API_KEY), model: config.OPENAI_MODEL };
}
