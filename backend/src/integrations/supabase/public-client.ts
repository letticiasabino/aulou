import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppEnv } from "../../config/env.js";

export function createPublicClient(config: AppEnv, accessToken?: string): SupabaseClient {
  const publishableKey = config.SUPABASE_PUBLISHABLE_KEY ?? config.SUPABASE_ANON_KEY;
  if (!config.SUPABASE_URL || !publishableKey) {
    throw new Error("Supabase public configuration is missing.");
  }

  return createClient(config.SUPABASE_URL, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
}
