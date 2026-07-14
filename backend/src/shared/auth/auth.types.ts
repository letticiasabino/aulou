import type { AppRole, AuthenticatedUser } from "../../integrations/supabase/types.js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type { AppRole, AuthenticatedUser };

export interface Authenticator {
  authenticate(accessToken: string): Promise<AuthenticatedUser>;
  createClient?(accessToken: string): SupabaseClient;
}
