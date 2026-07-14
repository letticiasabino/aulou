import type { AuthenticatedUser } from "../../integrations/supabase/types.js";
import type { SupabaseClient } from "@supabase/supabase-js";

declare module "fastify" {
  interface FastifyRequest {
    user: AuthenticatedUser | null;
    supabase: SupabaseClient | null;
  }
}
