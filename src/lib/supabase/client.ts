import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, publicEnv } from "@/config/env";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase public env is not configured.");
  }

  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey);
}

export { isSupabaseConfigured };
