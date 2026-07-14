import type { AppEnv } from "../../config/env.js";

export type SupabaseIntegration = {
  configured: boolean;
  url?: string;
};

export function createSupabaseIntegration(config: AppEnv): SupabaseIntegration {
  return {
    configured: Boolean(config.SUPABASE_URL && config.SUPABASE_ANON_KEY),
    url: config.SUPABASE_URL,
  };
}
