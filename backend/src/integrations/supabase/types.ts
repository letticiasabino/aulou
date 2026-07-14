import type { User } from "@supabase/supabase-js";

export type AppRole = "student" | "admin" | "support";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: AppRole;
  appMetadata?: Record<string, unknown>;
  userMetadata?: Record<string, unknown>;
}

export function toAuthenticatedUser(user: User): AuthenticatedUser {
  const appRole = user.app_metadata?.role;
  const role: AppRole = appRole === "admin" || appRole === "support" ? appRole : "student";

  return {
    id: user.id,
    email: user.email,
    role,
    appMetadata: user.app_metadata,
    userMetadata: user.user_metadata,
  };
}
