import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, publicEnv } from "@/config/env";
import type { Database } from "@/types/database.types";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase public env is not configured.");
  }

  return createBrowserClient<Database>(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey);
}

export { isSupabaseConfigured };
