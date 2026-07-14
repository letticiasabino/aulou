import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppEnv } from "../../config/env.js";

export function createAdminClient(config: AppEnv): SupabaseClient {
  if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin configuration is missing.");
  }

  return createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}
